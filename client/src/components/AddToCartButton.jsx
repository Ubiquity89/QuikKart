import React, { useEffect, useState } from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const AddToCartButton = ({ data }) => {
  const navigate = useNavigate();
  const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext();

  const [loading, setLoading] = useState(false);
  const cartItem = useSelector((state) => state.cartItem.cart);

  const [isAvailableCart, setIsAvailableCart] = useState(false);
  const [qty, setQty] = useState(0);
  const [cartItemDetails, setCartItemsDetails] = useState();

  const user = useSelector((state) => state.user);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  
  const handleADDTocart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent multiple clicks while checking
    if (isCheckingAuth) return;
    
    // Check if we have a token in localStorage
    const token = localStorage.getItem("accesstoken");
    
    if (!token) {
      toast.error("Please login to add items to the cart.");
      navigate("/login");
      return;
    }
    
    // If we have a token but no user data, try to fetch it
    if (token && !user?._id) {
      setIsCheckingAuth(true);
      try {
        const response = await Axios(SummaryApi.userDetails);
        if (response?.data?.success) {
          // If we got user data, update the Redux store
          const userDetails = response.data.data;
          const { setUserDetails } = require('../store/userSlice');
          dispatch(setUserDetails(userDetails));
          // Continue with adding to cart
        } else {
          // If no user data but we had a token, clear the invalid token
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshtoken");
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to verify your session. Please login again.");
        navigate("/login");
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    }

    try {
      setLoading(true);

      const response = await Axios({
        ...SummaryApi.addTocart,
        data: { productId: data?._id },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkingitem = cartItem.some(
      (item) => item.productId._id === data._id
    );
    setIsAvailableCart(checkingitem);

    const product = cartItem.find(
      (item) => item.productId._id === data._id
    );
    setQty(product?.quantity);
    setCartItemsDetails(product);
  }, [data, cartItem]);

  const increaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await updateCartItem(cartItemDetails?._id, qty + 1);

    if (response?.success) {
      toast.success("Item added");
    }
  };

  const decreaseQty = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (qty === 1) {
      deleteCartItem(cartItemDetails?._id);
    } else {
      const response = await updateCartItem(cartItemDetails?._id, qty - 1);

      if (response?.success) {
        toast.success("Item removed");
      }
    }
  };

  return (
    <div className="w-full max-w-[150px]">
      {isAvailableCart ? (
        <div className="flex w-full h-full">
          <button
            onClick={decreaseQty}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center"
          >
            <FaMinus />
          </button>

          <p className="flex-1 w-full font-semibold px-1 flex items-center justify-center">
            {qty}
          </p>

          <button
            onClick={increaseQty}
            className="bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center"
          >
            <FaPlus />
          </button>
        </div>
      ) : (
        <button
          onClick={handleADDTocart}
          className="bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded"
        >
          {loading ? <Loading /> : "Add"}
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
