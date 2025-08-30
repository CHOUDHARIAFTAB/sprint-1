// @ts-nocheck
import asyncHandler from 'express-async-handler';
// @ts-ignore
import { CartItem, Item } from '../modals/index.js';
import item from '../modals/item.js';

/**
 * This controller handles all shopping cart operations for a logged-in user.
 * It uses Sequelize to interact with the MySQL database.
 * Every function is designed to return a JSON response with a body.
 */

// GET /api/cart - Fetches all items in the user's cart
export const getCart = asyncHandler(async (req, res) => {
    const items = await CartItem.findAll({
        // @ts-ignore
        where: { userId: req.user.id },
        include: [{ model: Item }]
    });
    // @ts-ignore
    res.json(item.map(ci => ({
        // @ts-ignore
        _id: ci.id,
        // @ts-ignore
        item: ci.item,
        // @ts-ignore
        quantity: ci.quantity
    })));
});

// POST /api/cart - Adds a new item or updates the quantity of an existing item
// @ts-ignore
export const addToCart = asyncHandler(async (req, res) => {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity) {
        return res.status(400).json({ message: 'Missing itemId or quantity' });
    }

    // @ts-ignore
    let cartItem = await CartItem.findOne({ where: { userId: req.user.id, itemId: itemId } });
    
    if (cartItem) {
        // @ts-ignore
        cartItem.quantity += quantity;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            // @ts-ignore
            userId: req.user.id,
            itemId: itemId,
            quantity: quantity,
        });
    }
    // @ts-ignore
    const result = await CartItem.findByPk(cartItem.id, { include: [Item] });
    // @ts-ignore
    res.status(201).json({ _id: result.id, item: result.item, quantity: result.quantity });
});

// PUT /api/cart/:id - Updates the quantity of a specific cart item
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    // @ts-ignore
    const cartItem = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
    
    if (!cartItem) {
        res.status(404);
        throw new Error('Cart item not found');
    }
    // @ts-ignore
    cartItem.quantity = Math.max(1, quantity);
    await cartItem.save();
    
    // @ts-ignore
    const result = await CartItem.findByPk(cartItem.id, { include: [Item] });
    // @ts-ignore
    res.json({ _id: result.id, item: result.item, quantity: result.quantity });
});

// DELETE /api/cart/:id - Removes a specific item from the cart
export const deleteCartItem = asyncHandler(async (req, res) => {
    const numDeleted = await CartItem.destroy({
        // @ts-ignore
        where: { id: req.params.id, userId: req.user.id }
    });
    if (numDeleted === 0) {
        res.status(404);
        throw new Error('Cart item not found');
    }
    res.json({ _id: req.params.id });
});

// POST /api/cart/clear - Removes all items from the user's cart
export const clearCart = asyncHandler(async (req, res) => {
    await CartItem.destroy({
        // @ts-ignore
        where: { userId: req.user.id }
    });
    res.json({ message: 'Cart cleared' });
});