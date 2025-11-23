import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { FaCartShopping } from 'react-icons/fa6';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import DisplayCartItem from './DisplayCartItem';
import { FaArrowRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const CartMobileLink = () => {
    const { totalPrice, totalQty } = useGlobalContext();
    const cartItem = useSelector(state => state.cartItem?.cart || []);
    const [openCart, setOpenCart] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {cartItem?.length > 0 && (
                <div 
                    className='fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-2xl animate-slide-up'
                    style={{
                        animation: 'slideUp 0.5s ease-out forwards',
                        transform: 'translateY(100%)'
                    }}
                >
                    <div className='bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-2 text-white'>
                        <div className='max-w-4xl mx-auto flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='relative'>
                                    <div className='p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-md'>
                                        <FaCartShopping className='text-xl text-white'/>
                                    </div>
                                    {totalQty > 0 && (
                                        <span 
                                            className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-bounce'
                                        >
                                            {totalQty}
                                        </span>
                                    )}
                                </div>
                                <div className='text-sm'>
                                    <p className='font-medium text-white/90'>{totalQty} {totalQty === 1 ? 'item in cart' : 'items in cart'}</p>
                                    <p className='font-bold text-lg text-white'>{DisplayPriceInRupees(totalPrice)}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setOpenCart(true)}
                                className='flex items-center gap-2 bg-white text-green-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95'
                            >
                                <span>View Cart</span>
                                <FaArrowRight className='text-sm'/>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {openCart && (
                <DisplayCartItem close={() => setOpenCart(false)} />
            )}

            <style jsx global>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slideUp 0.5s ease-out forwards;
                }
                .animate-bounce {
                    animation: bounce 0.5s ease-in-out;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            `}</style>
        </>
    );
};

export default CartMobileLink;