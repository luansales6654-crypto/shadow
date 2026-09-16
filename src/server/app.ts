import express from 'express';
import { apiRouter } from './api.ts';

export const backendApp = express();

backendApp.use(express.json({ limit: '25mb' }));
backendApp.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Healthcheck
backendApp.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vende AI API', timestamp: new Date().toISOString() });
});

backendApp.use('/api', apiRouter);
