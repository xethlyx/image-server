import { Router } from 'express';
import formidable from 'formidable';
import { sequelize } from '..';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { file } from 'tmp-promise';

import bodyParser from 'body-parser';
import { validatedSettings } from '~/src/settings';

const uploadRouter = Router();

if (!validatedSettings.ALLOWED_IPS.includes('*')) {
    uploadRouter.use((req, res, next) => {
        if (!validatedSettings.ALLOWED_IPS.includes(req.ip)) {
            res.status(403).end('Forbidden');
            return;
        }

        next();
    });
}

const generateRandomString = (length?: number) => {
	let result = '';
	const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const charactersLength = characters.length;
	
	for (let i = 0; i < (length || 10); i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return result;
};

uploadRouter.post('/allowed', (req, res) => {
    res.status(200).end(JSON.stringify({
        allowed: true
    }));
});

uploadRouter.post('/image', (req, res) => {
    console.log('Attempting image upload..');

    const form = new formidable.IncomingForm();

	form.parse(req, async(error, fields, files) => {
		if (!files.imagedata) {
            console.log('Upload failed: No files uploaded.');
			res.status(400).end('No files uploaded.');
			return;
		}

        const oldPath = files.imagedata.path;
        
        const idExists = async(id: string) => {
            const count = await sequelize.model('png').count({
                where: {
                    id: id
                }
            });

            if (count > 0) return true;
            
            return false;
        }

		let fileName = generateRandomString(16);
		while (await idExists(fileName)) {
			fileName = generateRandomString(16);
        }

        const data = await fs.promises.readFile(oldPath);

        if (error) {
            console.log('Upload failed: ' + error.message);
            res.status(500).end(error.message);
            return;
        }

        await sequelize.model('png').create({
            id: fileName,
            value: data
        });

        res.status(200).end(`https://i.xethlyx.com/png/${fileName}`);

        fs.unlink(oldPath, (error) => {
            if (error) console.warn(error.message);
        });
	});
});

uploadRouter.post('/video', (req, res) => {
    console.log('Attempting video upload..');

    const form = new formidable.IncomingForm();

	form.parse(req, async(error, fields, files) => {
		if (!files.data) {
            console.log('Upload failed: No files uploaded.');
			res.status(400).end('No files uploaded.');
			return;
		}

        const oldPath = files.data.path;
        
        const idExists = async(id: string) => {
            const count = await sequelize.model('mp4').count({
                where: {
                    id: id
                }
            });

            if (count > 0) return true;
            
            return false;
        }

		let fileName = generateRandomString(16);
		while (await idExists(fileName)) {
			fileName = generateRandomString(16);
        }

        const data = await fs.promises.readFile(oldPath);

        if (error) {
            console.log('Upload failed: ' + error.message);
            res.status(500).end(error.message);
            return;
        }

        await sequelize.model('mp4').create({
            id: fileName,
            value: data
        });

        const { path, cleanup } = await file();

        const success = await new Promise<boolean>((res) => ffmpeg(oldPath)
            .renice(20)
            .inputFormat('mp4')
            .outputFormat('gif')
            .addOption('-vf', 'split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse')
            .noAudio()
            .on('end', () => {
                console.log(`File (gif) transcoded to ${path}`);
                res(true);
            })
            .on('error', (conversionError) => {
                console.log('Error while converting file: ' + conversionError);
                res(false);
            })
            .save(path)
        );

        if (!success) {
            cleanup();
            res.status(500).end(`An internal error occurred while uploading your image.`);
            return;
        }

        const gifData = await fs.promises.readFile(path);
        await sequelize.model('gif').create({
            id: fileName,
            value: gifData
        });

        cleanup();

        res.status(200).end(`https://i.xethlyx.com/anim/${fileName}`);

        fs.unlink(oldPath, (error) => {
            if (error) console.warn(error.message);
        });
	});
});

uploadRouter.post('/json', bodyParser.json(), async(req, res) => {
    if (!req.body.title || !req.body.description) {
        console.log(req.body)

        res.status(400).end();
        return;
    }

    const idExists = async(id: string) => {
        const count = await sequelize.model('json').count({
            where: {
                id: id
            }
        });

        if (count > 0) return true;
        
        return false;
    }

    let fileName = generateRandomString(16);
    while (await idExists(fileName)) {
        fileName = generateRandomString(16);
    }

    await sequelize.model('json').create({
        id: fileName,
        value: Buffer.from(JSON.stringify({
            title: req.body.title,
            description: req.body.description,
            redirect: req.body.redirect
        }))
    });

    res.status(200).end(`/embed/${fileName}`);
});

uploadRouter.post('/video-noconvert', (req, res) => {
    console.log('Attempting video upload..');

    const form = new formidable.IncomingForm();

	form.parse(req, async(error, fields, files) => {
		if (!files.data) {
            console.log('Upload failed: No files uploaded.');
			res.status(400).end('No files uploaded.');
			return;
		}

        const oldPath = files.data.path;
        
        const idExists = async(id: string) => {
            const count = await sequelize.model('mp4').count({
                where: {
                    id: id
                }
            });

            if (count > 0) return true;
            
            return false;
        }

		let fileName = generateRandomString(16);
		while (await idExists(fileName)) {
			fileName = generateRandomString(16);
        }

        const data = await fs.promises.readFile(oldPath);

        if (error) {
            console.log('Upload failed: ' + error.message);
            res.status(500).end(error.message);
            return;
        }

        await sequelize.model('mp4').create({
            id: fileName,
            value: data
        });

        res.status(200).end(`https://i.xethlyx.com/video/${fileName}`);

        fs.unlink(oldPath, (error) => {
            if (error) console.warn(error.message);
        });
	});
});

export default uploadRouter;