const forgotPasswordTemplate=({ name, otp })=>{
    return `
    <div>
    <p>Dear, ${name}</p>
    <p>You have requested to reset your password. Please use the OTP below to reset your password:</p>
    <div style="background:yellow; font-size:20px;padding:20px;text-align:center;font-weight:800">
    ${otp}
    </div>
    <p>This otp is valid for 1hr only. Enter this otp in the app to reset your password</p>
    <br/>
    <br/>
    <p>Thank you for using QuikKart</p>
    </div>
    `
}

export default forgotPasswordTemplate