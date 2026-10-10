import express from 'express';
import multer from 'multer';
import { handleUploadedRiddle } from '../controller/upload.controller.js';

const upload =  multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('image'), handleUploadedRiddle)