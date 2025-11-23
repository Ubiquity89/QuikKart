import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  }, [searchParams]);

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="loading-spinner"></div>
        <h2>Processing your order...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-success-container error">
        <div className="error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <div className="action-buttons">
          <button onClick={() => navigate('/orders')} className="btn primary">
            <FaShoppingBag /> View Orders
          </button>
          <button onClick={() => navigate('/')} className="btn secondary">
            <FaHome /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="success-icon">
        <FaCheckCircle />
      </div>
      <h2>Order Placed Successfully!</h2>
      <p>Thank you for your purchase. Your order has been received and is being processed.</p>
      
      {order && (
        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order ID:</span>
            <span className="value">{order.orderId}</span>
          </div>
          <div className="detail-row">
            <span className="label">Total Amount:</span>
            <span className="value">₹{order.totalAmt?.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Payment Status:</span>
            <span className="value success">{order.payment_status}</span>
          </div>
          <div className="detail-row">
            <span className="label">Order Status:</span>
            <span className="value">{order.status}</span>
          </div>
        </div>
      )}
      
      <div className="action-buttons">
        <Link to="/orders" className="btn primary">
          <FaShoppingBag /> View All Orders
        </Link>
        <Link to="/" className="btn secondary">
          <FaHome /> Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
