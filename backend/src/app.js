import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import destinationsRouter from './routes/destinations.js';
import placesRouter from './routes/places.js';
import reviewsRouter from './routes/reviews.js';
import experiencesRouter from './routes/experiences.js';
import festivalsRouter from './routes/festivals.js';
import foodRouter from './routes/food.js';
import blogRouter from './routes/blog.js';
import communityRouter from './routes/community.js';
import favoritesRouter from './routes/favorites.js';
import tripsRouter from './routes/trips.js';

import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Global Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check endpoints
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    service: 'Trail India REST API (Node.js & Express)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthCheck);
app.get('/api/v1/health', healthCheck);

// API v1 Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/places', placesRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/experiences', experiencesRouter);
app.use('/api/v1/festivals', festivalsRouter);
app.use('/api/v1/food', foodRouter);
app.use('/api/v1/foods', foodRouter);
app.use('/api/v1/blog', blogRouter);
app.use('/api/v1/community', communityRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/trips', tripsRouter);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

