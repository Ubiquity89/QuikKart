import jwt from 'jsonwebtoken'
const auth= async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];
        
        console.log('Auth middleware - token received:', token ? 'YES' : 'NO');
        console.log('Auth middleware - token source:', request.cookies.accessToken ? 'cookie' : 'header');
        
        if(!token) {
            console.log('Auth middleware - No token provided');
            return response.status(401).json({
                message: "Provide token",
            })
        }     
        
        console.log('Auth middleware - Verifying token with SECRET_KEY');
        const decode= await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)
        console.log('Auth middleware - Token decoded successfully:', decode);
        
        if(!decode){
            console.log('Auth middleware - Token decode failed');
            return response.status(401).json({
                message: "Unauthorized",
                error: true,
                success: false
            })
        }
        request.userId=decode.id
        console.log('Auth middleware - Set userId:', request.userId);
        next()                    
    } catch (error) {
        console.error('Auth middleware - Error:', error.message);
        
        // Return 401 for token errors (expired, invalid, etc.), not 500
        if (error.name === 'TokenExpiredError') {
            return response.status(401).json({
                message: "Token expired",
                error: true,
                success: false
            });
        }
        
        if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            });
        }
        
        // Only return 500 for unexpected server errors
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export default auth;
