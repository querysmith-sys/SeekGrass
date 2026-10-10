import type { Request, Response } from "express"
import { RiddleModel } from "../model/riddle.schema.js"

export const fetchRiddle = async (req: Request, res: Response) => {
    try {
        const riddle = await RiddleModel.aggregate([
            { $unwind: "$questions" },
            { $sample: { size: 1 } },
            { $project: { _id: 0, randomQuestion: "$questions" } }
        ])
        return res.status(200).json(riddle)

    } catch (error) {
        console.error("Failed to fetch Riddle: ", error)
    }
}

