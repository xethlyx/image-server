import express from 'express';
import { DataTypes, Sequelize, Op } from 'sequelize';
import { validate, validatedSettings } from './settings';
import contentRouter from './routes/content';
import existsRouter from './routes/exists';
import uploadRouter from './routes/upload';

validate();

export const sequelize = new Sequelize(validatedSettings.DATABASE);

sequelize.authenticate()
    .then(async result => {
        console.log('Successfully connected.');

        // set up data structures

        sequelize.define('png', {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            value: DataTypes.BLOB
        });

        sequelize.define('mp4', {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            value: DataTypes.BLOB
        });

        sequelize.define('gif', {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            value: DataTypes.BLOB
        });

        sequelize.define('json', {
            id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                primaryKey: true
            },
            value: DataTypes.BLOB
        });

        sequelize.sync();

        return result;
    })
    .catch(error => {
        console.error('Unable to connect to the database: ', error);
        process.exit(1);
    });

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', ['uniquelocal', 'loopback']);

app.use('/upload', uploadRouter);
app.use('/content', contentRouter);
app.use('/exists', existsRouter);

if (validatedSettings.CLEANUP.interval > 0) {
    setInterval(async() => {
        let deleted = 0;

        for (const ext of ['png', 'mp4', 'gif', 'json']) {
            const model = sequelize.model(ext); 

            const result = await model.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: Date.now() - validatedSettings.CLEANUP.maxAge
                    }
                }
            });

            deleted += result;
        }

        console.log(`Deleted ${deleted} old entries.`)
    }, validatedSettings.CLEANUP.interval);
}

export default app;