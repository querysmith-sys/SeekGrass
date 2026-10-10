import mongoose from "mongoose";

const riddleSchema = new mongoose.Schema({
    questions: [{
        questionText: {
            type: String,
            required: true
        },
    }],
}, {timestamps: true})


export const RiddleModel = mongoose.model('questions', riddleSchema)