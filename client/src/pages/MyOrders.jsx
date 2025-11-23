import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import SummaryApi from '../common/SummaryApi'
import { useSelector } from 'react-redux'
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { useLocation } from 'react-router-dom'

const MyOrders = () => {
  const user = useSelector(state => state.user)
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [highlightedOrderId, setHighlightedOrderId] = useState(location.state?.orderId || null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      console.log('Fetching orders...')
      const response = await Axios({
        ...SummaryApi.getOrderDetails
      })
      
      console.log('Orders response:', response.data)
      
      if (response.data.success) {
        console.log('Orders data:', response.data.data)
        // Group orders by orderId
        const groupedOrders = response.data.data.reduce((acc, order) => {
          if (!acc[order.orderId]) {
            acc[order.orderId] = {
              orderId: order.orderId,
              createdAt: order.createdAt,
              delivery_address: order.delivery_address,
              payment_status: order.payment_status,
              items: []
            }
          }
          acc[order.orderId].items.push(order)
          return acc
        }, {})
        
        console.log('Grouped orders:', groupedOrders)
        setOrders(Object.values(groupedOrders))
        
        // Clear the highlighted order ID after a delay
        if (highlightedOrderId) {
          setTimeout(() => setHighlightedOrderId(null), 5000)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?._id) {
      fetchOrders()
    }
  }, [user])

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'CASH ON DELIVERY':
        return <FaTruck className="text-blue-500" />
      case 'PAID':
        return <FaCheckCircle className="text-green-500" />
      case 'PENDING':
        return <FaClock className="text-yellow-500" />
      case 'EXPIRED':
        return <FaTimesCircle className="text-red-500" />
      default:
        return <FaBox className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CASH ON DELIVERY':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <FaBox className="text-gray-400 text-5xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 mt-2">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.orderId} 
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                highlightedOrderId === order.orderId ? 'ring-2 ring-green-500 ring-offset-2' : ''
              }`}
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Order ID: {order.orderId}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {highlightedOrderId === order.orderId && (
                      <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full animate-pulse">
                        Latest Order
                      </span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.payment_status)}`}>
                    {getStatusIcon(order.payment_status)}
                    <span className="ml-2">{order.payment_status}</span>
                  </span>
                </div>
                
                {order.delivery_address && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</p>
                    <p className="text-sm text-gray-600">{order.delivery_address.address_line}</p>
                    <p className="text-sm text-gray-600">
                      {order.delivery_address.city}, {order.delivery_address.state} - {order.delivery_address.pincode}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h4 className="font-medium mb-4">Order Items</h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.product_details.image[0]}
                        alt={item.product_details.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium">{item.product_details.name}</h5>
                        <p className="text-sm text-gray-500">Qty: 1</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{DisplayPriceInRupees(item.totalAmt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">
                      {DisplayPriceInRupees(order.items.reduce((sum, item) => sum + item.totalAmt, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
