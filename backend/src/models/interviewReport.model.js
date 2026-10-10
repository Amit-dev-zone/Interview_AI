const mongoose = require("mongoose") 

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "technical question is required"]
    }, 
    intention: {
        type: String,
        required: [true, "intention is required"]
    },
    answer: {
        type: String,
        required: [true, "answer is required"]
    }
}, {
    _id: false
})

const behaviouralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "technical question is required"]
    }, 
    intention: {
        type: String,
        required: [true, "intention is required"]
    },
    answer: {
        type: String,
        required: [true, "answer is required"]
    }
}, {
    _id: false
})


const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true,  "Skill is required"]
    },
    severity: {
       type: String,
       enum: ["low", "medium", "high"],
       required: [true, "Severity is required"]
    }
}, {
    _id: false
})


const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "day is required"]
    },
    focus: {
        type: String,
        required: [true, "focus is required"]
    },
    tasks: [{
        type: String,
        required: [true, "task is required"]
    }]
})



const interviewReportSchema = new mongoose.Schema({
    jobDescription:{
        type: String,
        required: [true, "job description is required"]
    },

    resume: {
        type: String,   
    },
    
    selfDescription: {
        type: String
    },

    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [ technicalQuestionSchema ],
    behaviouralQuestions: [behaviouralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],    
}, {
    timestamps: true
})


const interviewReportModel = mongoose.model("InterviewReport", interviewReportSchema)

module.exports = interviewReportModel;