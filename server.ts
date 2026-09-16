import express from 'express';
import path from 'path';
import { backendApp } from './src/server/app.ts';

const app = express();
const port = 3000;

app.use(backendApp);

// Serve static frontend assets from dist in production
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Vende AI Production Server listening on http://0.0.0.0:${port}`);
});
