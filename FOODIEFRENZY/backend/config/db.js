import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Initialize Sequelize with your database credentials from .env
const sequelize = new Sequelize(
  // @ts-ignore
  process.env.DB_NAME,      // 'foodiefrenzy_db'
  process.env.DB_USER,      // 'your_username'
  process.env.DB_PASSWORD,  // 'your_password'
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql'
  }
);

// in config/db.js
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
    // Sync all models with the database
    await sequelize.sync({ force: true }); // Use { force: true } to drop and recreate tables if they exist
    console.log('All tables have been created successfully.');
  } catch (error) {
    // ...
  }
};

export default sequelize;