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

const login = asyncHandler(async(req, res) => {
const {email, password,username} = req.body;
if(!username && !email){
throw new ApiError(400, "Please provide username or email to login")
}

const user = await User.findOne({
username : username ,
email : email 
})
if(!user){
throw new ApiError(401, "User does not exist. Please register first.")
}

const isPasswordValid = await user.isPasswordCorrect(password);
if(!isPasswordValid){
    throw new ApiError(401, "Password is not correct . Please try again.")
}

const {refreshToken , accessToken} = await generateAccessAndRefreshTokens(user._id) 

const loggedInUser =  await User.findById(user._id).select('-password -refreshToken -emailVerificationToken -emailVerificationExpiry');

const options = {
httpOnly : true,
secure : true ,
}

return res.status(200)
.cookie("refreshToken", refreshToken, options)
.cookie("accessToken", accessToken, options)
.json(
new ApiResponse(
200,
{user : loggedInUser, accessToken, refreshToken},
"User logged in successfully."
)
)




})


export {registerUser,login}