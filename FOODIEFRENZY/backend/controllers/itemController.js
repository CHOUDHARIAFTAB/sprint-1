// @ts-ignore
import { Item } from '../modals/index.js';

export const createItem = async (req, res, next) => {
    try {
        const { name, description, category, price, rating, hearts } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const newItem = await Item.create({
            name, description, category, price, rating, hearts, imageUrl
        });
        res.status(201).json(newItem);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Item name already exists' });
        } else {
            next(err);
        }
    }
};

export const getItems = async (req, res, next) => {
    try {
        const items = await Item.findAll({ order: [['createdAt', 'DESC']] });
        const host = `${req.protocol}://${req.get('host')}`;
        const withFullUrl = items.map(i => ({
            ...i.toJSON(),
            // @ts-ignore
            imageUrl: i.imageUrl ? host + i.imageUrl : '',
        }));
        res.json(withFullUrl);
    } catch (err) {
        next(err);
    }
};

export const deleteItem = async (req, res, next) => {
    try {
        const numDeleted = await Item.destroy({
            where: { id: req.params.id }
        });
        if (numDeleted === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(204).end();
    } catch (err) {
        next(err);
    }
};