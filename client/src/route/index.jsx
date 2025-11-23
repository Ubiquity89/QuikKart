import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import SearchPage from "../pages/SearchPage";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import ForgotPassword from "../pages/ForgotPassword";
import OtpVerification from "../pages/OtpVerification";
import ResetPassword from "../pages/ResetPassword";
import UserMenuMobile from "../pages/UserMenuMobile";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MyOrders from "../pages/MyOrders";
import Address from "../pages/Address";
import CategoryPage from "../pages/CategoryPage";
import SubCategoryPage from "../pages/SubCategoryPage";
import UploadProduct from "../pages/UploadProduct";
import ProductAdmin from "../pages/ProductAdmin";
import AdminPermision from "../layouts/AdminPermission.jsx";
import ProductListPage from "../pages/ProductListPage";
import ProductDisplayPage from "../pages/ProductDisplayPage";
import CheckoutPage from "../pages/CheckoutPage";
import Success from "../pages/Success";
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            // Public routes
            {
                path: "",
                element: <Home />
            },
            {
                path: ":category",
                element: <ProductListPage />
            },
            {
                path: ":category/:subCategory",
                element: <ProductListPage />
            },
            {
                path: "search",
                element: <SearchPage />
            },
            {
                path: "product/:product",
                element: <ProductDisplayPage />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />
            },
            {
                path: "verification-otp",
                element: <OtpVerification />
            },
            {
                path: "reset-password",
                element: <ResetPassword />
            },

            // Protected routes
            {
                path: "user",
                element: (
                    <ProtectedRoute>
                        <UserMenuMobile />
                    </ProtectedRoute>
                )
            },
            {
                path: "checkout",
                element: (
                    <ProtectedRoute>
                        <CheckoutPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "success",
                element: (
                    <ProtectedRoute>
                        <Success />
                    </ProtectedRoute>
                )
            },
            {
                path: "dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: "profile",
                        element: <Profile />
                    },
                    {
                        path: "myorders",
                        element: <MyOrders />
                    },
                    {
                        path: "address",
                        element: <Address />
                    },
                    {
                        path: "category",
                        element: (
                            <AdminPermision>
                                <CategoryPage />
                            </AdminPermision>
                        )
                    },
                    {
                        path: "subcategory",
                        element: (
                            <AdminPermision>
                                <SubCategoryPage />
                            </AdminPermision>
                        )
                    },
                    {
                        path: "upload-product",
                        element: (
                            <AdminPermision>
                                <UploadProduct />
                            </AdminPermision>
                        )
                    },
                    {
                        path: "product",
                        element: (
                            <AdminPermision>
                                <ProductAdmin />
                            </AdminPermision>
                        )
                    }
                ]
            }
        ]
    }
]);

export default router