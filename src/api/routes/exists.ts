import { Router } from 'express';
import { sequelize } from '..';

const existsRouter = Router();

existsRouter.get('/:ext/:id', async(req, res) => {
    const id = String(req.params.id);
    const ext = String(req.params.ext);

    if (!id || !ext) {
        res.status(400).end();
        return;
    };
    
    if (!['png', 'mp4', 'gif', 'json'].includes(ext)) {
        res.status(400).end();
        return;
    }

    const contentCount = await sequelize.model(ext).count({
        where: {
            id: id
        }
    });

    if (contentCount === 0) {
        res.status(200).end(JSON.stringify({
            found: false
        }));
        
        return;
    }

    res.status(200).end(JSON.stringify({
        found: true
    }));
});

export default existsRouter;