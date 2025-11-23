import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import productReducer from './productSlice'
import cartReducer from './cartProduct'
import addressReducer from './addressSlice'
import orderReducer from './orderSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    product : productReducer,
    cartItem: cartReducer,
    address: addressReducer,
    order: orderReducer
  },
});

export default store;
