import { body } from "express-validator";


// The user registration validator
const userRegisterValidator = ()=> {
return [
body("email")
.trim()
.notEmpty().withMessage("Email is required")
.isEmail().withMessage("Please provide a valid email address"),

body("username")
.trim()
.notEmpty().withMessage("Username is required")
.isLowercase().withMessage("Username must be in lowercase")
.isLength({min:3, max:30}).withMessage("Username must be between 3 and 30 characters long"),

body("password")
.trim()
.notEmpty().withMessage("Password is required")
.isLength({min:6}).withMessage("Password must be at least 6 characters long"),

body("fullName")
.optional()
.trim()

]

}


const userLoginValidator = ()=> {
return [
body("email")
.optional()
.isEmail().withMessage("Please provide a valid email address"),

body("password")
.trim()
.notEmpty().withMessage("Password is required"),

body("username")
.optional()
.trim()
.isLowercase().withMessage("Username must be in lowercase")
.isLength({min:3, max:30}).withMessage("Username must be between 3 and 30 characters long"),
]
}


export {userRegisterValidator , userLoginValidator }