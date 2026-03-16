const logger = require('./utils/logger')
const config = require('./utils/config')
const express = require('express')
const notesRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

const app = express()

const mongoUrl = config.MONGODB_URI

logger.info('connecting to', config.MONGODB_URI)

mongoose
    .connect(mongoUrl, { family: 4 })
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connection to MongoDB:', error.message)
    })

app.use(express.json())

app.use('/api/blogs', notesRouter)

module.exports = app