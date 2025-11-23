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

orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.get("/order-list", auth, getOrderDetailsController)

// Stripe Checkout route
orderRouter.post('/create-payment-intent', auth, StripeCheckoutController);

// Stripe webhook - must be before bodyParser is used
orderRouter.post('/webhook', 
    bodyParser.raw({ type: 'application/json' }), 
    handleStripeWebhook
);

// Verify payment and create order
orderRouter.get('/verify-payment', verifyPayment);

export default orderRouter