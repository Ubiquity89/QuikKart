export const baseURL = import.meta.env.VITE_API_URL

const SummaryApi = {
    register: {
        url: "/api/user/register",
        method: "post"
    },
    login: {
        url: "/api/user/login",
        method: "post"
    },
    forgot_password: {
        url: "/api/user/forgot-password",
        method: "put"
    },
    forgot_password_otp_verification: {
        url: "/api/user/verify-forgot-password-otp",
        method: "put"
    },
    reset_password: {
        url: "/api/user/reset-password",
        method: "put"
    },
    refresh_token: {
        url: "/api/user/refresh-token",
        method: "post"
    },
    userDetails: {
        url: "/api/user/user-details",
        method: "get"
    },
    logout: {
        url: "/api/user/logout",
        method: "post"
    },
     uploadAvatar : {
        url : "/api/user/upload-avatar",
        method : 'put'
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
    addCategory: {
        url: '/api/category/add-category',
        method: 'post'
    },
    getCategory: {
        url: '/api/category/get',
        method: 'get'
    },
    updateCategory: {
        url: '/api/category/update',
        method: 'put'
    },
    uploadImage:{
        url:'/api/file/upload-image',
        method:'post'
    },
    deleteCategory: {
         url:'/api/category/delete',
        method:'delete'
    },
    createSubCategory: {
        url: '/api/subCategory/create',
        method: 'post'
    },
    getSubCategory: {
        url: '/api/subCategory/get',
        method: 'post'
    },
    updateSubCategory: {
        url: '/api/subCategory/update',
        method: 'put'
    },
    deleteSubCategory: {
        url: '/api/subCategory/delete',
        method: 'delete'
    },
    createProduct: {
        url: '/api/product/create',
        method: 'post'
    },
    addTocart: {
        url: '/api/cart/create',
        method: 'post'
    },
    getCartItem: {
        url: '/api/cart/get',
        method: 'get'
    },
    updateCartItemQty: {
        url: '/api/cart/update-qty',
        method: 'put'
    },
    deleteCartItem: {
        url: '/api/cart/delete-cart-item',
        method: 'delete'
    },
    getProduct: {
        url: '/api/product/get',
        method: 'post'
    },
    getProductByCategory: {
        url: '/api/product/get-product-by-category',
        method: 'post'
    },
    getProductByCategoryAndSubCategory: {
        url: '/api/product/get-product-by-category-and-subcategory',
        method: 'post'
    },
    getProductDetails: {
        url: '/api/product/get-product-details',
        method: 'post'
    },
    updateProductDetails: {
        url: '/api/product/update-product-details',
        method: 'put'
    },
    deleteProduct: {
        url: '/api/product/delete-product',
        method: 'delete'
    },
    searchProduct: {
        url: '/api/product/search-product',
        method: 'post'
    },
    addTocart: {
        url: '/api/cart/create',
        method: 'post'
    },
    getCartItem: {
        url: '/api/cart/get',
        method: 'get'
    },
    updateCartItemQty: {
        url: '/api/cart/update-qty',
        method: 'put'
    },
    deleteCartItem: {
        url: '/api/cart/delete-cart-item',
        method: 'delete'
    },
    createAddress: {
        url: '/api/address/create',
        method: 'post'
    },
    getAddress: {
        url: '/api/address/get',
        method: 'get'
    },
    updateAddress: {
        url: '/api/address/update/:id',
        method: 'put'
    },
    deleteAddress: {
        url: '/api/address/delete/:id',
        method: 'delete'
    },
    CashOnDeliveryOrder: {
        url: '/api/order/cash-on-delivery',
        method: 'post'
    },
    payment_url: {
        url: '/api/order/create-payment-intent',
        method: 'post'
    },
    getOrderDetails: {
        url: '/api/order/order-list',
        method: 'get'
    }
}

export default SummaryApi
