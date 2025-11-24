import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder, fetchAddress } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.address?.addressList || [])
  const [selectAddress, setSelectAddress] = useState(null)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(true)

  // Fetch addresses when component mounts
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoadingAddress(true)
        await fetchAddress()
      } catch (error) {
        console.error('Error loading addresses:', error)
        toast.error('Failed to load addresses')
      } finally {
        setIsLoadingAddress(false)
      }
    }
    
    loadAddresses()
  }, [fetchAddress])

  const validateAddress = () => {
    if (selectAddress === null || selectAddress === undefined) {
      toast.error('Please select a delivery address')
      return false
    }
    if (addressList.length === 0) {
      toast.error('No delivery addresses found. Please add an address first.')
      return false
    }
    if (!addressList[selectAddress]?._id) {
      toast.error('Invalid address selected')
      return false
    }
    return true
  }

 const handleCashOnDelivery = async () => {
  if (!validateAddress()) {
    return;
  }
  
  setIsLoading(true);
  try {
    const response = await Axios({
      ...SummaryApi.CashOnDeliveryOrder,
      data: {
        list_items: cartItemsList,
        addressId: addressList[selectAddress]?._id,
        subTotalAmt: totalPrice,
        totalAmt: totalPrice,
      }
    });

    const { data: responseData } = response;

    if (responseData.success) {
      toast.success(responseData.message);
      if (fetchCartItem) {
        await fetchCartItem();
      }
      if (fetchOrder) {
        await fetchOrder();
      }
      
      // Get the first order from the response
      const order = responseData.data?.[0];
      if (order) {
        navigate('/success', {
          state: {
            orderId: order._id || order.orderId,
            orderDetails: order
          }
        });
      } else {
        // Fallback if order data structure is different
        navigate('/success', {
          state: {
            orderId: 'N/A',
            orderDetails: {
              orderId: responseData.orderId || 'N/A',
              totalAmt: totalPrice,
              payment_status: 'Paid (Cash on Delivery)'
            }
          }
        });
      }
    }
  } catch (error) {
    AxiosToastError(error);
  } finally {
    setIsLoading(false);
  }
};
 const handleOnlinePayment = async () => {
  if (!validateAddress()) {
    return;
  }
  
  try {
    setIsProcessingPayment(true);
    toast.loading("Processing payment...");

    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (!stripePublicKey) {
      toast.error('Stripe is not configured properly. Please try again later.');
      console.error('Stripe public key is missing');
      return;
    }
    
    // Initialize Stripe with the public key
    const stripe = await loadStripe(stripePublicKey, {
      // Optional: Add any additional options here
    });
    
    if (!stripe) {
      toast.error('Failed to initialize payment. Please try again.');
      return;
    }

    const response = await Axios({
      ...SummaryApi.payment_url,
      data: {
        list_items: cartItemsList,
        addressId: addressList[selectAddress]?._id,
        subTotalAmt: totalPrice,
        totalAmt: totalPrice,
      }
    });

    const { data: responseData } = response;

    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to create payment session');
    }

    if (!responseData.data?.url) {
      throw new Error('Invalid session URL received');
    }

    // Redirect to Stripe Checkout
    window.location.href = responseData.data.url;
    
  } catch (error) {
    console.error('Payment error:', error);
    toast.error(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
  } finally {
    setIsProcessingPayment(false);
    toast.dismiss(); // Clear any loading toasts
  }
};

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          <h3 className='text-lg font-semibold'>Choose your address</h3>
          <div className='bg-white p-2 grid gap-4'>
            {isLoadingAddress ? (
              <div className='text-center py-4'>Loading addresses...</div>
            ) : addressList.length > 0 ? (
              addressList.map((address, index) => (
                <label key={address._id} htmlFor={"address" + index}>
                  <div className='border rounded p-3 flex gap-3 hover:bg-blue-50'>
                    <div>
                      <input 
                        id={"address" + index} 
                        type='radio' 
                        value={index} 
                        checked={selectAddress === index}
                        onChange={(e) => setSelectAddress(Number(e.target.value))} 
                        name='address' 
                      />
                    </div>
                    <div>
                      <p>{address.address_line}</p>
                      <p>{address.city}</p>
                      <p>{address.state}</p>
                      <p>{address.country} - {address.pincode}</p>
                      <p>{address.mobile}</p>
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <div className='text-center py-4'>No saved addresses found. Please add an address.</div>
            )}
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
              Add address
            </div>
          </div>



        </div>

        <div className='w-full max-w-md bg-white py-4 px-2'>
          {/**summary**/}
          <h3 className='text-lg font-semibold'>Summary</h3>
          <div className='bg-white p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quntity total</p>
              <p className='flex items-center gap-2'>{totalQty} item</p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>Free</p>
            </div>
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p >Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <button className='py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-white font-semibold flex items-center justify-center gap-2' onClick={handleOnlinePayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  Processing...
                </>
              ) : (
                'Online Payment'
              )}
            </button>

            <button className='py-2 px-4 border-2 border-green-600 font-semibold text-green-600 hover:bg-green-600 hover:text-white flex items-center justify-center gap-2' onClick={handleCashOnDelivery} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
                  Processing...
                </>
              ) : (
                'Cash on Delivery'
              )}
            </button>
          </div>
        </div>
      </div>


      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }
    </section>
  )
}

export default CheckoutPage