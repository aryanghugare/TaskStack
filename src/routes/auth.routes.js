import { Router } from "express";
import {registerUser} from "../controllers/auth.controllers.js"
import { userRegisterValidator ,userForgotPasswordValidator,userResetForgotPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { login } from "../controllers/auth.controllers.js";
import {userLoginValidator} from "../validators/index.js"
import {verifyJWT} from '../middlewares/auth.middleware.js'
import {logoutUser,getCurrentUser,emailVerification,refreshAccessToken,forgotPassword,resetForgotPassword,changeCurrentPassword,resendEmailVerification} from "../controllers/auth.controllers.js";

const router = Router();



// unsecured routes
// validate is the middleware that will check for validation errors
// userRegisterValidator is the function that returns an array of validation rules
router.route("/register").post(userRegisterValidator() ,validate,registerUser); // Here the thing is we are adding the validator middleware to the route before the controller function
router.route("/login").post(userLoginValidator() ,validate,login);
router.route("/verify-email/:verificationToken").get(emailVerification);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPassword);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword)


// secured routes 
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,changeCurrentPassword); // Here i dont need any validators because , i did the validation in the controller itself
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification)





export default router;