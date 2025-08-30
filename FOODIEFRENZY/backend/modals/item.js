// After (Sequelize)
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Item = sequelize.define('item', {
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  rating: { type: DataTypes.INTEGER, defaultValue: 0 },
  hearts: { type: DataTypes.INTEGER, defaultValue: 0 },
  imageUrl: { type: DataTypes.STRING }
});

export default Item;