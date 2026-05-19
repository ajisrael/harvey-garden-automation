import dotenv from 'dotenv';
import express from 'express';
import actionsRoutes from './routes/actionsRoutes.js';
import nodeRoutes from './routes/nodeRoutes.js';
import gardenBedRoutes from './routes/gardenBedRoutes.js';
import gardenStatusRoutes from './routes/gardenStatusRoutes.js';
import pumpRoutes from './routes/pumpRoutes.js';
import solenoidRoutes from './routes/solenoidRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  console.log('API is running...');
  res.send('API is running...');
});

app.use('/api/v1/actions', actionsRoutes);
app.use('/api/v1/node', nodeRoutes);
app.use('/api/v1/gardenBed', gardenBedRoutes);
app.use('/api/v1/gardenStatus', gardenStatusRoutes);
app.use('/api/v1/pumpState', pumpRoutes);
app.use('/api/v1/solenoidState', solenoidRoutes);
app.use('/api/v1/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

export default app;
