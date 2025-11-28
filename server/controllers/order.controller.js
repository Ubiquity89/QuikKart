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
    console.log("Stripe checkout session request received");

    const userId = request.userId;
    const { list_items, metadata_items, addressId } = request.body;

    if (!list_items || list_items.length === 0)
      return response.status(400).json({ success: false, message: "No items provided" });

    if (!addressId)
      return response.status(400).json({ success: false, message: "Address required" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,

      customer_email: request.user.email,

      metadata: {
        userId,
        addressId,
        items: metadata_items  // ✔ SEND STRINGIFIED ITEMS
      },

      line_items: list_items.map(item => ({
        price_data: {
          currency: "inr",
          product_data: {
            name: item.product_details.name,
            images: item.product_details.image ? [item.product_details.image] : []
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      }))
    });

    return response.json({
      success: true,
      url: session.url
    });

  } catch (err) {
    console.error("Stripe session error:", err);
    return response.status(500).json({ success: false, message: err.message });
  }
}



export async function handleStripeWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const userId = session.metadata.userId;
      const addressId = session.metadata.addressId;
      const items = JSON.parse(session.metadata.items);

      const orders = await Promise.all(
        items.map(async item => {
          return await OrderModel.create({
            userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: item.productId,
            product_details: item.product_details,
            paymentId: session.payment_intent,
            payment_status: "PAID",
            delivery_address: addressId,
            subTotalAmt: session.amount_subtotal / 100,
            totalAmt: session.amount_total / 100,
            status: "Processing",
            quantity: item.quantity
          });
        })
      );

      // Clear cart
      await CartProductModel.deleteMany({ userId });
      await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook processing error:", error);
      return res.status(400).json({ error: error.message });
    }
  }

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

