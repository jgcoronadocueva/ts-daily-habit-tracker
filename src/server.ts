// server.ts

import express, { Request, Response } from 'express';
import habitRoutes from './routes/habitRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 3000;;
const app = express();

// Needed to parse JSON requests
app.use(express.json());

// Home route
app.get('/', (_req: Request, res: Response) => {
  res.send('Daily Habit Tracker API is running!');
});

// Routes
app.use('/habits', habitRoutes);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Daily Habit Tracker API running at http://localhost:${PORT}`);
});