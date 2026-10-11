import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import { riddleRouter } from './routes/riddle.route.js';
import { uploadRouter } from './routes/upload.route.js';
import { addRiddleQuestionRouter } from './routes/custom-questions.route.js';
const app = express();
connectDb();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://seekgrass-client.onrender.com'],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/riddles', riddleRouter);
app.use('/api/verify', uploadRouter);
app.use('/api/questions', addRiddleQuestionRouter)
app.listen(3000, () => {
  console.log('server started at 3000');
});