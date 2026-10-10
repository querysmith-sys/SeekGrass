import express from 'express';
import { connectDb } from './config/db.js';
import { riddleRouter } from './routes/riddle.route.js';
import { uploadRouter } from './routes/upload.route.js';

const app = express();
connectDb();
app.use(express.json());
app.use('/riddles', riddleRouter);
app.use('/verify', uploadRouter);

app.listen(3000, () => {
    console.log("server started")
})