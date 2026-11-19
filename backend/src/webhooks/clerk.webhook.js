import express from 'express'
import { verifyWebhook } from '@clerk/express/webhooks'
import User from '../models/user.model.js'

const router = express.Router()

router.post('/', async (req, res) => {
  console.log('========== CLERK WEBHOOK HIT ==========')

  try {
    console.log('Body is Buffer:', Buffer.isBuffer(req.body))

    const evt = await verifyWebhook(req)

    console.log('Verified Clerk event:', evt.type)

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const u = evt.data

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(' ') ||
        u.username ||
        email?.split('@')[0] ||
        'User'

      const savedUser = await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          $set: {
            email,
            fullName,
            profilePic: u.image_url,
          },
          $setOnInsert: {
            clerkId: u.id,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      )

      console.log('MongoDB user saved:', savedUser._id)
    }

    if (evt.type === 'user.deleted') {
      if (evt.data.id) {
        await User.findOneAndDelete({
          clerkId: evt.data.id,
        })

        console.log('MongoDB user deleted:', evt.data.id)
      }
    }

    return res.status(200).json({
      success: true,
      received: true,
    })
  } catch (err) {
    console.error('CLERK WEBHOOK ERROR:', err)

    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }
})

export default router
