import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import dataloggerRoutes from './routes/dataloggerRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import pool from './config/database.js';


dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/dataloggers', dataloggerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/alarms', alarmRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// Cerrar el pool de conexiones y el servidor HTTP cuando se recibe una señal SIGINT.
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    try {
      await pool.end();
      console.log('Database connection pool closed');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    } catch (err) {
      console.error('Error closing the database connection pool', err);
      process.exit(1);
    }
  });
