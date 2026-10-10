import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { riddleRouter } from './routes/riddle.route.js';
import { uploadRouter } from './routes/upload.route.js';

const app = express();
connectDb();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/riddles', riddleRouter);
app.use('/verify', uploadRouter);

app.listen(3000, () => {
  console.log('server started at 3000');
});