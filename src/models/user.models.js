import mongoose , {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new Schema({



avatar: {
type : {
url : String, // This is the URL of the service where the image is stored , example AWS S3, Cloudinary etc
localPath : String // This is the local path where the image is stored in our server

},
default : {
url : `https://placehold.co/200X200`, // Placeholder image URL 
// This is a default image URL
localPath : ""
}

},


username : {
type : String,
required : true,
unique : true,
lowercase : true,
trim : true,
minlength : 3,
index: true // Creating index on username field for faster search
// Dont do indexing on every field , only on those fields which are frequently used in search queries
},



email : {
type : String,
required : true,
unique : true,
lowercase : true,
trim : true,

},

fullName : {
type : String,
trim : true,
minlength : 3
},

password : {
type : String,
required : [true, "Password is required"],

},

isEmailVerified : {
type : Boolean,
default : false,
},


refreshToken : {
type : String,

},

forgotPasswordToken : {
type : String,
},


forgotPasswordTokenExpiry : {
type : Date,

},

emailVerificationToken : {
type : String,
},

emailVerificationExpiry : {
type : Date,

}


},
{timestamps: true}
);

// This is a Hook 
// Pre-save hook to hash password before saving to database
// This will also work when user updates the password
userSchema.pre('save',async function(next){

if(!this.isModified('password')) return next();

this.password =  await bcrypt.hash(this.password,10) 
next();
}) // For this dont use arrow function , Because we need 'this' keyword




// Method to verify password
// we could also create this method in controller but its better to keep it in model
userSchema.methods.isPasswordCorrect = async function (password) {
return await bcrypt.compare(password, this.password); // This returns true or false
}


// Method to generate access token
userSchema.methods.generateAccessToken = function (){
 return jwt.sign(
{
_id : this._id,
username : this.username,
email : this.email
},// This is the payload
process.env.ACCESS_TOKEN_SECRET, // This is the secret key
{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // This is the expiry time
)
}


// Method to generate refresh token
userSchema.methods.generateRefreshToken = function (){
return jwt.sign({
_id : this._id
}, // This is the payload
process.env.REFRESH_TOKEN_SECRET, // This is the secret key
{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // This is the expiry time
)

}


// Method to generate temporary token for email verification and password reset
userSchema.methods.generateTemporaryToken = function (){
const unHashedToken =  crypto.randomBytes(32).toString('hex');
const hashedToken = crypto
.createHash('sha256')
.update(unHashedToken)
.digest('hex')
const tokenExpiry = Date.now() + (20 * (60 * 1000)); // Token valid for 20 minutes
return {hashedToken, unHashedToken, tokenExpiry};
}

export const User = mongoose.model('User', userSchema);
