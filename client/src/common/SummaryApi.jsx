export const baseURL = import.meta.env.VITE_BACKEND_URL

const SummaryApi = {
    register: {
        url: `${baseURL}/api/user/register`,
        method: "post"
    },
    login: {
        url: `${baseURL}/api/user/login`,
        method: "post"
    },
    forgot_password: {
        url: `${baseURL}/api/user/forgot-password`,
        method: "put"
    },
    forgot_password_otp_verification: {
        url: `${baseURL}/api/user/verify-forgot-password-otp`,
        method: "put"
    },
    reset_password: {
        url: `${baseURL}/api/user/reset-password`,
        method: "put"
    },
    refresh_token: {
        url: `${baseURL}/api/user/refresh-token`,
        method: "post"
    },
    userDetails: {
        url: `${baseURL}/api/user/user-details`,
        method: "get"
    },
    logout: {
        url: `${baseURL}/api/user/logout`,
        method: "post"
    },
    uploadAvatar: {
        url: `${baseURL}/api/user/upload-avatar`,
        method: 'put'
    },
    updateUserDetails: {
        url: `${baseURL}/api/user/update-user`,
        method: 'put'
    },
    addCategory: {
        url: `${baseURL}/api/category/add-category`,
        method: 'post'
    },
    getCategory: {
        url: `${baseURL}/api/category/get`,
        method: 'get'
    },
    updateCategory: {
        url: `${baseURL}/api/category/update`,
        method: 'put'
    },
    uploadImage: {
        url: `${baseURL}/api/file/upload-image`,
        method: 'post'
    },
    deleteCategory: {
        url: `${baseURL}/api/category/delete`,
        method: 'delete'
    },
    createSubCategory: {
        url: `${baseURL}/api/subCategory/create`,
        method: 'post'
    },
    getSubCategory: {
        url: `${baseURL}/api/subCategory/get`,
        method: 'get'
    },
    updateSubCategory: {
        url: `${baseURL}/api/subCategory/update`,
        method: 'put'
    },
    deleteSubCategory: {
        url: `${baseURL}/api/subCategory/delete`,
        method: 'delete'
    },
    createProduct: {
        url: `${baseURL}/api/product/create`,
        method: 'post'
    },
    addTocart: {
        url: `${baseURL}/api/cart/create`,
        method: 'post'
    },
    getCartItem: {
        url: `${baseURL}/api/cart/get`,
        method: 'get'
    },
    updateCartItemQty: {
        url: `${baseURL}/api/cart/update-qty`,
        method: 'put'
    },
    deleteCartItem: {
        url: `${baseURL}/api/cart/delete-cart-item`,
        method: 'delete'
    },
    getProduct: {
        url: `${baseURL}/api/product/get`,
        method: 'post'
    },
    getProductByCategory: {
        url: `${baseURL}/api/product/get-product-by-category`,
        method: 'post'
    },
    getProductByCategoryAndSubCategory: {
        url: `${baseURL}/api/product/get-product-by-category-and-subcategory`,
        method: 'post'
    },
    getProductDetails: {
        url: `${baseURL}/api/product/get-product-details`,
        method: 'post'
    },
    updateProductDetails: {
        url: `${baseURL}/api/product/update-product-details`,
        method: 'put'
    },
    deleteProduct: {
        url: `${baseURL}/api/product/delete-product`,
        method: 'delete'
    },
    searchProduct: {
        url: `${baseURL}/api/product/search-product`,
        method: 'post'
    },
    createAddress: {
        url: `${baseURL}/api/address/create`,
        method: 'post'
    },
    getAddress: {
        url: `${baseURL}/api/address/get`,
        method: 'get'
    },
    updateAddress: {
        url: `${baseURL}/api/address/update/:id`,
        method: 'put'
    },
    deleteAddress: {
        url: `${baseURL}/api/address/delete/:id`,
        method: 'delete'
    },
    CashOnDeliveryOrder: {
        url: `${baseURL}/api/order/cash-on-delivery`,
        method: 'post'
    },
    stripeCheckout: {
        url: `${baseURL}/api/order/create-checkout-session`,
        method: 'post'
    },
    getOrderDetails: {
        url: `${baseURL}/api/order/order-list`,
        method: 'get'
    },
    verifyPayment: {
        url: `${baseURL}/api/order/verify-payment`,
        method: 'get'
    }
}

export default SummaryApi