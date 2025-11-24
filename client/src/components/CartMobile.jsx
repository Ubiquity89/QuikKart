import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { FaCartShopping } from 'react-icons/fa6';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import DisplayCartItem from './DisplayCartItem';
import { FaArrowRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const CartContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  animation: ${slideUp} 0.5s ease-out forwards;
  transform: translateY(100%);
  @media (min-width: 768px) {
    display: none;
  }
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const CartHeader = styled.div`
  background: linear-gradient(to right, #34c759, #2ecc71);
  padding: 1rem;
  color: #fff;
`;

const CartItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CartItemIcon = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(10px);
`;

const CartItemBadge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background-color: #e74c3c;
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.25rem;
  border-radius: 50%;
  animation: ${bounce} 0.5s ease-in-out;
`;

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
        <CartContainer>
          <CartHeader>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <CartItemInfo>
                <CartItemIcon>
                  <FaCartShopping className="text-xl text-white" />
                  {totalQty > 0 && (
                    <CartItemBadge>
                      {totalQty}
                    </CartItemBadge>
                  )}
                </CartItemIcon>
                <div className="text-sm">
                  <p className="font-medium text-white/90">{totalQty} {totalQty === 1 ? 'item in cart' : 'items in cart'}</p>
                  <p className="font-bold text-lg text-white">{DisplayPriceInRupees(totalPrice)}</p>
                </div>
              </CartItemInfo>

              <button
                onClick={() => setOpenCart(true)}
                className="flex items-center gap-2 bg-white text-green-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <span>View Cart</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </CartHeader>
        </CartContainer>
      )}

      {openCart && (
        <DisplayCartItem close={() => setOpenCart(false)} />
      )}
    </>
  );
};

export default CartMobileLink;