import express from 'express'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'
import { connectDB } from './lib/db.js' // Import the connectDB function from db.js

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL

const publicDir = path.join(process.cwd(), 'public')

app.use(express.json()) //allow to parse JSON data in the request body
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
)
app.use(clerkMiddleware()) // Use Clerk middleware for authentication

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

//if the public directory exists, serve the static files
//this is for the production build
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))

  app.get('/{*any}', (req, res, next) => {
    res.sendFile(path.join(publicDir, 'index.html'), (err) => next(err))
  })
}

app.listen(PORT, () => {
  connectDB() // Call the connectDB function to establish a connection to MongoDB
  console.log(`Server is running on port ${PORT}`)
})
