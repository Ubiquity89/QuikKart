import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import stripe from '../config/stripe.js';

export async function CashOnDeliveryOrderController(request,response){
    try {
        const userId = request.userId // auth middleware 
        const { list_items, totalAmt, addressId,subTotalAmt } = request.body 

        const payload = list_items.map(el => {
            return({
                userId : userId,
                orderId : `ORD-${new mongoose.Types.ObjectId()}`,
                productId : el.productId._id, 
                product_details : {
                    name : el.productId.name,
                    image : el.productId.image
                } ,
                paymentId : "",
                payment_status : "CASH ON DELIVERY",
                delivery_address : addressId ,
                subTotalAmt  : subTotalAmt,
                totalAmt  :  totalAmt,
            })
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        ///remove from the cart
        const removeCartItems = await CartProductModel.deleteMany({ userId : userId })
        const updateInUser = await UserModel.updateOne({ _id : userId }, { shopping_cart : []})

        return response.json({
            message : "Order successfully",
            error : false,
            success : true,
            data : generatedOrder
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export async function getOrderDetailsController(request,response){
    try {
        console.log('getOrderDetailsController called')
        console.log('userId from request:', request.userId)
        
        const userId = request.userId // order id

        const orderlist = await OrderModel.find({ userId : userId }).sort({ createdAt : -1 }).populate('delivery_address')
        
        console.log('Found orders:', orderlist.length)

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })
    } catch (error) {
        console.error('Error in getOrderDetailsController:', error)
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// server/controllers/order.controller.js
export async function StripeCheckoutController(request, response) {
    try {
        console.log('Stripe checkout request received');
        const userId = request.userId;
        const { list_items, addressId, subTotalAmt, totalAmt } = request.body;

        console.log('Request data:', { 
            userId, 
            itemsCount: list_items?.length, 
            addressId, 
            totalAmt 
        });

        // Validation
        if (!list_items || list_items.length === 0) {
            return response.status(400).json({
                message: "No items in cart",
                error: true,
                success: false
            });
        }

        if (!addressId) {
            return response.status(400).json({
                message: "Please select an address",
                error: true,
                success: false
            });
        }

        // Format line items for Stripe
        const line_items = list_items.map(item => {
            const price = item.productId?.price || 0;
            let images = [];
            
            // Handle different image formats
            if (item.productId?.image) {
                if (Array.isArray(item.productId.image)) {
                    // If it's already an array, use it directly
                    images = item.productId.image;
                } else if (typeof item.productId.image === 'object') {
                    // If it's an object, convert its values to an array
                    images = Object.values(item.productId.image);
                } else if (typeof item.productId.image === 'string') {
                    // If it's a string, use it as a single image
                    images = [item.productId.image];
                }
            }

            // Ensure we only pass valid URLs to Stripe
            const validImages = images.filter(img => 
                typeof img === 'string' && 
                (img.startsWith('http://') || img.startsWith('https://'))
            );

            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.productId?.name || 'Product',
                        description: item.productId?.description || '',
                        images: validImages.length > 0 ? validImages : undefined
                    },
                    unit_amount: Math.round(price * 100), // Convert to paise
                },
                quantity: item.quantity || 1,
            };
        });

        // Create Stripe session with more details in success URL
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
             success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/checkout?cancelled=true`,
            metadata: {
                userId: userId.toString(),
                addressId: addressId,
                // Only include essential data to stay under 500 chars
                items: JSON.stringify(list_items.map(item => ({
                    p: item.productId?._id, // productId
                    q: item.quantity       // quantity
                })))
            }
        });

        return response.json({
            success: true,
            data: {
                url: session.url,
                sessionId: session.id
            }
        });

    } catch (error) {
        console.error('Stripe checkout error:', error);
        return response.status(500).json({
            message: error.message || "Error creating payment session",
            error: true,
            success: false
        });
    }
}

export async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        try {
            const { userId, addressId } = session.metadata;
            const items = JSON.parse(session.metadata.items);
            
            // Create order in database
            const orders = await Promise.all(items.map(async (item) => {
                const order = new OrderModel({
                    userId: userId,
                    orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                    productId: item.productId,
                    product_details: {
                        name: item.product_details?.name || 'Product',
                        image: item.product_details?.image || ''
                    },
                    paymentId: session.payment_intent,
                    payment_status: 'PAID',
                    delivery_address: addressId,
                    subTotalAmt: session.amount_subtotal / 100, // Convert from cents to currency
                    totalAmt: session.amount_total / 100, // Convert from cents to currency
                    status: 'Processing',
                    quantity: item.quantity || 1
                });
                return await order.save();
            }));

            // Clear user's cart
            await CartProductModel.deleteMany({ userId: userId });
            await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

            console.log('Created orders:', orders);
            return res.status(200).json({ received: true });
            
        } catch (error) {
            console.error('Error processing webhook:', error);
            return res.status(400).json({ error: error.message });
        }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
}

export async function verifyPayment(req, res) {
    try {
        const { session_id } = req.query;
        if (!session_id) return res.status(400).json({ message: "Session ID is required", error: true, success: false });

        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'payment_intent', 'line_items.data.price.product']
        });

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: "Payment not completed", error: true, success: false });
        }

        const userId = session.metadata.userId;
        const addressId = session.metadata.addressId;
        const items = JSON.parse(session.metadata.items);

        // Create orders directly from metadata
        const orders = await Promise.all(items.map(async (item) => {
            const order = new OrderModel({
                userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: item.p,
                product_details: { name: "Product", image: "" }, // optional: fetch product details if needed
                paymentId: session.payment_intent.id,
                payment_status: 'PAID',
                delivery_address: addressId,
                subTotalAmt: session.amount_subtotal / 100,
                totalAmt: session.amount_total / 100,
                status: 'Processing',
                quantity: item.q || 1
            });
            return await order.save();
        }));

        // Clear user's cart
        await CartProductModel.deleteMany({ userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return res.json({ message: "Order created successfully", data: orders, error: false, success: true });

    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({ message: error.message || "Error verifying payment", error: true, success: false });
    }
}
