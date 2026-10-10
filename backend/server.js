require("dotenv").config()
const app = require("./src/app.js")
const connectedToDB = require("./src/confic/database.js")
const invokeAI = require("./src/services/ai.service.js")

connectedToDB()

// invokeAI()

app.listen(3000, () => {
    console.log("server is running on 3000")
})