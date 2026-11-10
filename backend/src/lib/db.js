import mongoose from 'mongoose'

async function connectDB() {
  try {
    const mongoURI = process.env.MONGO_URI
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables')
    }
    const conn = await mongoose.connect(mongoURI)
    console.log('MongoDb is successfully connected', conn.connection.host)
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1) // Exit the process with failure
    // Exit with process 0 is success and 1 is failure
  }
}

export { connectDB }
