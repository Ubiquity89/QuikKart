import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { handleAddItemCart } from '../store/cartProduct';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Verify payment and create order
        const response = await axios.get(`/api/order/verify-payment?session_id=${sessionId}`);
        
        if (response.data.success) {
          setOrder(response.data.data[0]); // Assuming the first order in the array
          
          // Clear cart after successful order
          dispatch(handleAddItemCart([]));
          
          toast.success('Order placed successfully!');
        } else {
          setError('Failed to verify payment');
          toast.error('Failed to verify payment. Please check your orders.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Error verifying payment. Please check your orders.');
        toast.error('Error verifying payment. Please check your orders.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-medium text-gray-800">Processing your order...</h2>
        <p className="mt-2 text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-red-600 font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => navigate('/orders')} 
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <FaShoppingBag /> View Orders
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              <FaHome /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <FaCheckCircle className="text-green-600 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been received and is being processed.</p>
        </div>

        {order && (
          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="text-lg font-semibold text-gray-800">{order.orderId}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-semibold text-gray-800">₹{order.totalAmt?.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className="text-lg font-semibold text-green-600">{order.payment_status}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <FaHome /> Continue Shopping
          </button>
          <button
            onClick={() => navigate('/dashboard/myorders', { state: { orderId: order?.orderId || '' } })}
            className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-4 rounded-lg transition duration-200"
          >
            <FaShoppingBag /> View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default Success
