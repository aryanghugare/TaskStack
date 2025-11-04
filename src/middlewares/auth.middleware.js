// We need this code to only give access if the user has the acces token  
// If it is missing or invalid, we need to block the access
// This file will be used in many projects 
import {User} from '../models/user.models.js'
import {ApiError} from '../utils/api-error.js'
import {asyncHandler} from '../utils/async-handler.js'
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler (async (req, res, next) => {
try {
const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
if(!Token){
throw new ApiError(433,"You dont have access to this data")
}

const decodedToken =  jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
// this decodedToken will have the payload that we set while generating the token in user model
// which is user id  
const user = await User.findById(decodedToken?._id).select('-password -refreshToken -emailVerificationToken -emailVerificationExpiry');
if(!user){
throw new ApiError(433,"Invalid access token" )
}
req.user = user;
next();
 

} catch (error) {
throw new ApiError(491,error?.message || "Invalid access token")    
}


})

