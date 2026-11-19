import express from 'express'
import fs from 'fs'
import path from 'path'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import clerkWebHook from './webhooks/clerk.webhook.js'
import cors from 'cors'
import { connectDB } from './lib/db.js' // Import the connectDB function from db.js
import job from './lib/cron.js'

const app = express()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL
const publicDir = path.join(process.cwd(), 'public')

// it is important that we don't parse the webhook event data, it should be in the raw format
app.use(
  '/api/webhooks/clerk',
  express.raw({ type: 'application/json' }),
  clerkWebHook,
)

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
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'Clerk webhook secret configured:',
      Boolean(process.env.CLERK_WEBHOOK_SIGNING_SECRET),
    )
    job.start()
  }
})
