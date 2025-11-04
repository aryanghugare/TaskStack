import {User} from '../models/user.models.js'
import {ApiResponse} from '../utils/api-response.js'
import {ApiError} from '../utils/api-error.js'
import {asyncHandler} from '../utils/async-handler.js'
import {sendEmail, emailVerficationMailgenContent,forgotPasswordMailgenContent} from '../utils/mail.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

// I have done this here in every controller but 
// use the try catch in every controller to catch the errors properly 


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


const logoutUser = asyncHandler(async(req, res) => {
const user= req.user;
if(!user) throw new ApiError(401, "User not found")

 const updatedUser = await User.findByIdAndUpdate(req.user._id,
{
$set : {refreshToken : "",
}
},
{new : true}
);
/*
// we can do this too here 
// both are same
const updatedUser = await User.findByIdAndUpdate(req.user._id,
{
refreshToken : "",
},
{new : true}
)

*/

const options = {
httpOnly : true,
secure : true ,
}

return res.status(200)
.clearCookie("refreshToken", options)
.clearCookie("accessToken", options)
.json(new ApiResponse(200,{},"User logged out successfully")
);

});

const getCurrentUser = asyncHandler(async(req, res) => {
const user = req.user ;
if(!user) throw new ApiError(401, "User not found")

return res.status(200)
.json(new ApiResponse(200,{user},"Current user fetched successfully"))
})

// Controller to handle email verification
const emailVerification = asyncHandler(async(req,res)=>{
const {verificationToken} = req.params;
if(!verificationToken) throw new ApiError(400, "Email Verification token is missing")

let hashedToken = crypto
.createHash("sha256")
.update(verificationToken)
.digest("hex");

const user = await User.findOne({
  emailVerificationToken : hashedToken,
  emailVerificationExpiry : {$gt : Date.now()}
})
if(!user) throw new ApiError(400, "Invalid or expired email verification token")

user.isEmailVerified = true;
user.emailVerificationToken = undefined;
user.emailVerificationExpiry = undefined;
await user.save({validateBeforeSave : false});

return res.status(200)
.json(new ApiResponse(200,{ isEmailVerified: true },"Email verified successfully"))

})




// This can only done by the user who is logged in 
// Soo here now the previous email verification token is invalid
// In this method we will generate a new email verification token  
// This method will only send the email again 
// But the thing of email verification will be done in the emailVerification controller

const resendEmailVerification = asyncHandler(async(req,res)=>{
const user = await User.findById(req.user._id);
if(!user) throw new ApiError(401, "User not found")
if(user.isEmailVerified) throw new ApiError(400, "Email is already verified")

// Generate new email verification token
// this will be similar to the one in register controller

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

return res.status(200)
.json(new ApiResponse(200,{},"Verification email resent successfully"));




})

const refreshAccessToken = asyncHandler(async(req,res)=>{
try {
    
const {incomingRefreshToken} = req.cookies.refreshToken || req.body.refreshToken;

if(!incomingRefreshToken) throw new ApiError(401, "Refresh token is missing")

/* // In this part we will find the user with the incoming refresh token
// Find user with this refresh token
const user = await User.findOne({ refreshToken: incomingRefreshToken });

if (!user) {
    throw new ApiError(401, "Invalid refresh token");
}
*/
const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
// this decodedToken will have the payload that we set while generating the token in user model
// which is user id  

const user = await User.findById(decodedToken?._id).select('-password -refreshToken -emailVerificationToken -emailVerificationExpiry');
if(!user) throw new ApiError(433,"Invalid refresh token" )

// Now we need to check if the incoming refresh token matches the one stored in the database
// The situation also can be that the user has logged out  
if(user.refreshToken !== incomingRefreshToken){
    throw new ApiError(401, "Refresh token does not match")
}
const {accessToken, refreshToken : newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

user.refreshToken = newRefreshToken;
await user.save({validateBeforeSave : false})
const options = {
httpOnly : true,
secure : true ,
}


return res.status(200)
.cookie("refreshToken", newRefreshToken, options)
.cookie("accessToken", accessToken, options)
.json( new ApiResponse(201,{AccessToken : accessToken, RefreshToken : newRefreshToken},"Access token refreshed successfully") );
} catch (error) {
    throw new ApiError(432, "SomeThing went wrong while refreshing access token",error )
}



})


// Here the data will come from the frontend that is email
// which will be used to find the user
// The user will fill a form with his email
// Here the user is not logged in obiviously
// Request to change the password 
// in the params we will have the reset token from this controller

const forgotPassword = asyncHandler(async(req,res)=>{
const {email} = req.body;
if(!email) throw new ApiError(400, "Please provide email address")

const user = await User.findOne({
email : email 
})
if(!user) throw new ApiError(401, "User does not exist. Please register first.")

const{hashedToken, unHashedToken, tokenExpiry} = user.generateTemporaryToken()
user.forgotPasswordToken = hashedToken;
user.forgotPasswordTokenExpiry = tokenExpiry;
await user.save({validateBeforeSave : false});

/*
// One way to send the email 
// the same as email verification
await sendEmail(
{
email:user?.email,
subject : "Password Reset Request",
mailgenContent : forgotPasswordMailgenContent(user.username,`${req.protocol}://${req.get("host")}/api/v1/users/forgot-password/${unHashedToken}`) // Here the verification URL is dynamically generated

},

);

*/

// Another way to send the email for forget password 
// we will have a redirect url in .env file
 
await sendEmail(
{
email:user?.email,
subject : "Password Reset Request",
mailgenContent : forgotPasswordMailgenContent(user.username,`${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`) // Here the verification URL is not  dynamically generated unlike email verification

},

);

return res.status(200)
.json(new ApiResponse(200,{},"Password reset email sent successfully. Please check your inbox."))

});

// This is the controller that will actually reset the password
const resetForgotPassword = asyncHandler(async(req,res)=>{
const {resetToken} = req.params;
const {newPassword} = req.body;
if(!resetToken) throw new ApiError(400, "Password reset token is missing")
if(!newPassword) throw new ApiError(400, "Please provide new password")

let hashedToken = crypto
.createHash("sha256")
.update(resetToken)
.digest("hex");

// As the database will have only the hashed token
const user = await User.findOne({
forgotPasswordToken : hashedToken,
forgotPasswordTokenExpiry : {$gt : Date.now()}
})
if(!user) throw new ApiError(489, "Invalid or expired password reset token")

user.password = newPassword;
user.forgotPasswordToken = undefined;
user.forgotPasswordTokenExpiry = undefined;
await user.save({validateBeforeSave : false});

return res.status(200)
.json(new ApiResponse(200,{},"Password reset successfully"))
})


// Here the user is logged in already
const changeCurrentPassword = asyncHandler(async(req,res)=>{
try {
const user = await User.findById(req.user._id);
if(!user) throw new ApiError(401, "User not found")

const {currentPassword, newPassword} = req.body;
if(!currentPassword || !newPassword){
    throw new ApiError(400, "Please provide current and new password")
}
if(currentPassword === newPassword) throw new ApiError(400, "New password must be different from current password")

const isPasswordValid = await user.isPasswordCorrect(currentPassword);
if(!isPasswordValid) throw new ApiError(401, "Current password is not correct . Please try again.")


user.password = newPassword;
await user.save({validateBeforeSave : false});

return res.status(200)
.json(new ApiResponse(200,{},"Password changed successfully"))


    
} catch (error) {
    throw new ApiError(500, "SomeThing went wrong while changing password",error )
}

})








export {registerUser,login,logoutUser,getCurrentUser,emailVerification,resendEmailVerification,refreshAccessToken,forgotPassword,
resetForgotPassword,changeCurrentPassword
}