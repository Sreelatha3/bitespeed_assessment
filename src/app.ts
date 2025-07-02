import express, { Request, Response } from 'express';
import { identifyContact } from './identify';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/identify', (req, res) => {
  res.send('Please POST to /identify with JSON: { email, phoneNumber }');
});

app.post('/identify', identifyContact);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
