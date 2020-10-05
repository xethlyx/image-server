import { Router } from 'express';
import { sequelize } from '..';

const contentRouter = Router();

contentRouter.get('/:ext/:id', async(req, res, next) => {
    const ext = String(req.params.ext);

    const splitId = String(req.params.id).split('.');
    if (splitId.length > 1 && splitId[1] !== ext) {
        res.status(400).end();
        return;
    }

    const id = splitId[0];

    if (!id || !ext) {
        res.status(400).end();
        return;
    };
    
    let contentType: null | string = null;

    switch(ext) {
        case 'png':
            contentType = 'image/png';
            break;
        case 'mp4':
            contentType = 'video/mp4';
            break;
        case 'gif':
            contentType = 'image/gif';
            break;
        case 'json':
            contentType = 'application/json';
            break;
        default:
            res.status(400).end();
            return;
    }

    const imageData = await sequelize.model(ext).findOne({
        where: {
            id: id
        }
    });

    if (!imageData) {
        res.status(404).end();
        
        return;
    }

    res.header('Content-Type', contentType);
    res.status(200).end(imageData.get('value'));
});

export default contentRouter;