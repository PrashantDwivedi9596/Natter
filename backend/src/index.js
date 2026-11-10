import express from 'express'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import cors from 'cors'
import { connectDB } from './lib/db.js' // Import the connectDB function from db.js

const app = express()
const PORT = process.env.PORT || 3000

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
app.listen(PORT, () => {
  connectDB() // Call the connectDB function to establish a connection to MongoDB
  console.log(`Server is running on port ${PORT}`)
})
