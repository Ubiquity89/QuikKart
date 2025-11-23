const verifyEmailTemplate = ({name,url}) => {
    return `
    <p>Dear ${name}</p>
    <p>Thank you for registering on QuikKart</p>
    <p>Please click on the link below to verify your email</p>
    <a href=${url} style="color:white;background: blue; margin-top : 10px">Verify Email</a>
    `
}

export default verifyEmailTemplate
