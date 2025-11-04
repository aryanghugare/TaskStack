import { Router } from "express";
import {registerUser} from "../controllers/auth.controllers.js"
import { userRegisterValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";
import { login } from "../controllers/auth.controllers.js";
import {userLoginValidator} from "../validators/index.js"

const router = Router();

router.route("/register").post(userRegisterValidator() ,validate,registerUser); // Here the thing is we are adding the validator middleware to the route before the controller function
// validate is the middleware that will check for validation errors
// userRegisterValidator is the function that returns an array of validation rules


router.route("/login").post(userLoginValidator() ,validate,login);

export default router;