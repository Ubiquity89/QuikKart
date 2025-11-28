import { Router } from 'express'
import auth from '../middleware/auth.js'
import { 
    CashOnDeliveryOrderController, 
    getOrderDetailsController, 
    StripeCheckoutController,
    handleStripeWebhook,
    verifyPayment
} from '../controllers/order.controller.js'
import bodyParser from 'body-parser'

const orderRouter = Router()

// -----------------------------------------
// 1️⃣ STRIPE WEBHOOK — MUST BE FIRST
// -----------------------------------------
orderRouter.post(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }), 
    handleStripeWebhook
)

// -----------------------------------------
// 2️⃣ NORMAL JSON BODY PARSER FOR ALL OTHER ROUTES
// -----------------------------------------
orderRouter.use(bodyParser.json())

// -----------------------------------------
// 3️⃣ YOUR PROTECTED ORDER ROUTES
// -----------------------------------------
orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.get("/order-list", auth, getOrderDetailsController)

// Stripe Checkout Session
orderRouter.post('/create-checkout-session', auth, StripeCheckoutController);

// Verify Payment
orderRouter.get('/verify-payment', verifyPayment);

export default orderRouter
