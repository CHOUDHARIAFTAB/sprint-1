// backend/routes/orderRoute.js

import express from 'express';
import {
    createOrder,
    confirmPayment, // Re-add this
    getOrders,
    getAllOrders,
    getOrderById,
    updateAnyOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.js';

const orderRouter = express.Router();

// Public route for payment confirmation
orderRouter.get('/confirm', confirmPayment); // Keep this route for Stripe redirects

// ... keep all your other existing routes
orderRouter.get('/getall', getAllOrders);
orderRouter.put('/getall/:id', updateAnyOrder);

orderRouter.use(authMiddleware);
orderRouter.post('/', createOrder);
orderRouter.get('/', getOrders);
orderRouter.get('/:id', getOrderById);

export default orderRouter;