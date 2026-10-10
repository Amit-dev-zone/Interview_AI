require("dotenv").config()
const app = require("./src/app.js")
const connectedToDB = require("./src/confic/database.js")
const invokeAI = require("./src/services/ai.service.js")

connectedToDB()

// invokeAI()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
})