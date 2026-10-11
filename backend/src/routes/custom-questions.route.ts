import express from 'express';
import { addRiddleQuestion } from '../controller/add-riddle-questions.controller.js';

export const addRiddleQuestionRouter = express.Router();

addRiddleQuestionRouter.post('/', addRiddleQuestion)
