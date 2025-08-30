import Stripe from 'stripe';
import { Order, OrderItem, User } from '../modals/index.js';
import sequelize from '../config/db.js';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a new order
export const createOrder = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { paymentMethod, items, total, ...otherDetails } = req.body;

        const newOrder = await Order.create({
            ...otherDetails,
            userId: req.user.id,
            paymentMethod,
            total,
            paymentStatus: paymentMethod === 'cod' ? 'succeeded' : 'pending',
        }, { transaction: t });

        const orderItemsData = items.map(({ item, quantity }) => ({
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            quantity,
            orderId: newOrder.id,
        }));
        await OrderItem.bulkCreate(orderItemsData, { transaction: t });

        if (paymentMethod === 'online') {
            const line_items = items.map((item) => ({
                price_data: {
                    currency: 'inr',
                    product_data: { name: item.item.name },
                    unit_amount: Math.round(item.item.price * 100),
                },
                quantity: item.quantity,
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
                success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/myorder/verify?success=false`,
            });
            
            newOrder.sessionId = session.id;
            await newOrder.save({ transaction: t });

            await t.commit();
            return res.status(201).json({ success: true, checkoutUrl: session.url });
        }

        // For COD
        await t.commit();
        res.status(201).json({ success: true, order: newOrder });

    } catch (error) {
        await t.rollback();
        console.error('createOrder error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Confirm payment after Stripe redirect
export const confirmPayment = async (req, res) => {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: 'session_id is required' });

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            await Order.update(
                { paymentStatus: 'succeeded' },
                { where: { sessionId: session_id } }
            );
            return res.json({ success: true, message: 'Payment confirmed' });
        }
        res.status(400).json({ success: false, message: 'Payment not completed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Get orders for the logged-in user
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [{ model: OrderItem }] // Join with OrderItem table
        });
        res.json(orders);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all orders (for admin)
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
            include: [
                { model: OrderItem },
                { model: User, attributes: ['username', 'email'] } // Also join with User table
            ]
        });
        res.json(orders);
    } catch (error) {
        console.error('getAllOrders error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update any order status (for admin)
export const updateAnyOrder = async (req, res) => {
    try {
        const { status } = req.body;
        const [numUpdated] = await Order.update(
            { status: status },
            { where: { id: req.params.id } }
        );

        if (numUpdated === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const updatedOrder = await Order.findByPk(req.params.id);
        res.json(updatedOrder);
    } catch (error) {
        console.error('updateAnyOrder error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get a single order by ID (for a user)
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: OrderItem }]
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error('getOrderById error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};