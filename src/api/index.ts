import express from 'express';
import { DataTypes, Sequelize, Op } from 'sequelize';
import contentRouter from './routes/content';
import existsRouter from './routes/exists';
import uploadRouter from './routes/upload';
import settings from '../config/settings.json';

export const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: './sqlite.db',
    dialectOptions: {

    }
});

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
        return error;
    });

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', ['uniquelocal', 'loopback']);

app.use('/upload', uploadRouter);
app.use('/content', contentRouter);
app.use('/exists', existsRouter);

if (settings.cleanup.enabled) {
    setInterval(async() => {
        let deleted = 0;

        for (const ext of ['png', 'mp4', 'gif', 'json']) {
            const model = sequelize.model(ext); 

            const result = await model.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: Date.now() - settings.cleanup.maxAge
                    }
                }
            });

            deleted += result;
        }

        console.log(`Deleted ${deleted} old entries.`)
    }, settings.cleanup.interval);
}

export default app;