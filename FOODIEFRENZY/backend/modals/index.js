import User from './userModel.js';
import Item from './item.js';
import CartItem from './cartItem.js';
import Order from './order.js';
import OrderItem from './orderItem.js';

// User and CartItem (One-to-Many)
User.hasMany(CartItem);
CartItem.belongsTo(User);

// Item and CartItem (One-to-Many)
Item.hasMany(CartItem);
CartItem.belongsTo(Item);

// User and Order (One-to-Many)
User.hasMany(Order);
Order.belongsTo(User);

// Order and OrderItem (One-to-Many)
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// Export all models
export { User, Item, CartItem, Order, OrderItem };