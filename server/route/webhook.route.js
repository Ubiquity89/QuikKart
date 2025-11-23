import express from 'express'
import OrderModel from '../models/order.model.js'
import CartProductModel from '../models/cartproduct.model.js'
import UserModel from '../models/user.model.js'
import stripe from '../config/stripe.js'

const router = express.Router()

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event

    try {
        // Check if webhook secret is configured
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY
        
        if (webhookSecret && webhookSecret !== 'whsec_placeholder_key') {
            // Verify webhook signature
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
        } else {
            // For testing without webhook secret, parse the body directly
            console.warn('Webhook secret not configured, skipping signature verification')
            event = JSON.parse(req.body)
        }
    } catch (err) {
        console.log(`Webhook signature verification failed:`, err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object
            console.log('Payment successful for session:', session.id)
            
            try {
                // Update order status to PAID
                await OrderModel.updateMany(
                    { paymentId: session.id },
                    { payment_status: 'PAID' }
                )

                // Clear user's cart
                if (session.metadata?.userId) {
                    await CartProductModel.deleteMany({ userId: session.metadata.userId })
                    await UserModel.updateOne(
                        { _id: session.metadata.userId },
                        { shopping_cart: [] }
                    )
                }

                console.log('Order marked as PAID and cart cleared')
            } catch (error) {
                console.error('Error updating order:', error)
            }
            break

        case 'checkout.session.expired':
            const expiredSession = event.data.object
            console.log('Payment expired for session:', expiredSession.id)
            
            try {
                // Update order status to EXPIRED
                await OrderModel.updateMany(
                    { paymentId: expiredSession.id },
                    { payment_status: 'EXPIRED' }
                )
                console.log('Order marked as EXPIRED')
            } catch (error) {
                console.error('Error updating order:', error)
            }
            break

        default:
            console.log(`Unhandled event type: ${event.type}`)
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send()
})

export default router
