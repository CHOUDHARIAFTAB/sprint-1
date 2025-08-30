// After (Sequelize)
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('user', { // Note: sequelize automatically pluralizes this to 'users' for the table name
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default User;