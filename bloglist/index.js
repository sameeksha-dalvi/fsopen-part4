const logger = require('./utils/logger')
const config = require('./utils/config')
const express = require('express')
const notesRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const app = express()

const mongoUrl = config.MONGODB_URI

mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())

app.use('/api/blogs', notesRouter)



const PORT = config.PORT || 3003
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})