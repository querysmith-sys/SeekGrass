import { RiddleModel } from "./model/riddle.schema.js"
import RiddlesQuestions from "./riddles.json" with {type: "json"} 
import { connectDb } from "./config/db.js"
console.log(RiddlesQuestions.questions)

const seedQuestions = async () => {
    // feed all the questions to db
    try {
        await connectDb()
        // await RiddleModel.deleteMany({})
        await RiddleModel.create({
            questions: RiddlesQuestions.questions
        });
        console.log("Questions seeded successfully.")
    } catch (error) {
        console.error("Error seeding questions:", error)
    }
}
seedQuestions()