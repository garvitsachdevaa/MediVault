import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';

import { env, clientOrigins } from './config/env.js';
import { generalLimiter } from './middleware/rateLimits.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/AppError.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, health pings, same-origin) and listed clients.
      const normalized = origin ? origin.replace(/\/+$/, '') : origin;
      if (!origin || clientOrigins.includes(normalized)) return callback(null, true);
      // Disallowed origin: block cleanly (no CORS headers) instead of throwing a 500.
      return callback(null, false);
    },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());

if (env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(generalLimiter);

app.use('/api', apiRoutes);

// Unknown route -> standard 404 error shape.
app.use((req, res, next) => next(new NotFoundError('Route not found')));

app.use(errorHandler);

export default app;
