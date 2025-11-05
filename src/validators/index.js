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

// Here we can write the validator for changeCurrentPassword too
// but i have already validated the current password and new password in the controller itself
/*
const userChangeCurrentPasswordValidator = () => {
  return [
    body("currentPassword").notEmpty().withMessage("current Password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ];
};

*/

 
const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};


const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};








export {userRegisterValidator , userLoginValidator ,userForgotPasswordValidator,userResetForgotPasswordValidator}