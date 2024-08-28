import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const poolData = mysql.createPool({
  host: process.env.DB_HOST_DATA,
  user: process.env.DB_USER_DATA,
  password: process.env.DB_PASSWORD_DATA,
  database: process.env.DB_NAME_DATA,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export  { pool, poolData };
