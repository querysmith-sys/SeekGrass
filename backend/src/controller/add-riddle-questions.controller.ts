import type { Request, Response } from "express";
import { RiddleModel } from "../model/riddle.schema.js";

export const addRiddleQuestion = async (req: Request, res: Response) => {
    try {
        // rawquestions format:
        //         {
        //   "questions": [
        //     "I speak without a mouth and hear without ears.\nI have no body, but I come alive with wind.\nWhat am I?",
        //     "A man pushes his car to a hotel and tells the owner he's bankrupt.\nWhy did he do this?",
        //     "The person who makes it has no need of it;\nthe person who buys it has no use for it.\nThe person who uses it can neither see nor feel it.\nWhat is it?"
        //   ]
        // }

        const rawQuestions = req.body.questions;

        if (!Array.isArray(rawQuestions)) {
            return res.status(400).json({ error: "Missing or invalid 'questions' array" });
        }

        const cleanedQuestions = rawQuestions
            .map(q => q.trim())
            .filter(q => q.length > 0);
        console.log("Cleaned Questions:", cleanedQuestions);
        await RiddleModel.create({
            questions: cleanedQuestions.map(questionText => ({ questionText }))
        });
        res.status(200).json({ message: "Questions added successfully" })
    } catch (error) {
        console.error("Error adding riddle questions:", error);
        res.status(500).json({ error: true, message: "Internal server error" })
    }
}