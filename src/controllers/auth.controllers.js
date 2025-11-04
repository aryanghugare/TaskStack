import {User} from '../models/user.models.js'
import {ApiResponse} from '../utils/api-response.js'
import {ApiError} from '../utils/api-error.js'
import {asyncHandler} from '../utils/async-handler.js'
import {sendEmail, emailVerficationMailgenContent} from '../utils/mail.js'


const generateAccessAndRefreshTokens = async(userId)=> {
    // Implementation for generating access and refresh tokens
try {
   const user = await User.findById(userId)
 const accessToken =  user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

user.refreshToken = refreshToken;
await user.save({validateBeforeSave : false})

return {accessToken, refreshToken}

} catch (error) {
    throw new ApiError(500, "Error generating tokens")
}

}




const registerUser = asyncHandler(async(req, res) => {
const {username,email,password,role} = req.body

const existingUser =  await User.findOne({
$or : [{username},{email}]
})

if(existingUser){
    throw new ApiError(409, "Username or Email already exists",[])
}

const user = await User.create({
email,
username,
password,
isEmailVerified : false,

})
 


 const { hashedToken, unHashedToken, tokenExpiry} = user.generateTemporaryToken();
user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;

await user.save({validateBeforeSave : false});
await sendEmail(
{
email:user?.email,
subject : "Please verify your email address",
mailgenContent : emailVerficationMailgenContent(user.username,`${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`) // Here the verification URL is dynamically generated

},

);
const createdUser =  await User.findById(user._id).select('-password -refreshToken -emailVerificationToken -emailVerificationExpiry');

if(!createdUser){
    throw new ApiError(404, "Something went wrong while registering the user!!!")

}

return res.status(201)
.json(
new ApiResponse(
200,
{user : createdUser},
"User registered successfully. Please verify your email address."

)
)

})


export {registerUser}