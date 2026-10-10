import express from 'express';
import { fetchRiddle } from '../controller/riddle.controller.js';

export const riddleRouter = express.Router();

riddleRouter.get('/', fetchRiddle)