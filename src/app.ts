import express, { Request, Response } from 'express';
import { identifyContact } from './identify';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/identify', identifyContact);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
