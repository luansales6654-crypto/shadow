import express from 'express';
import { backendApp } from '../src/server/app.ts';

const app = express();
app.use(backendApp);

export default app;
