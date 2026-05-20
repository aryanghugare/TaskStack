import { body } from "express-validator";
import { AvailableUserRole } from "../utils/constants.js";


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


// Project validators
const createProjectValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ min: 2, max: 120 })
      .withMessage("Project name must be between 2 and 120 characters"),
    body("description").optional().trim().isLength({ max: 2000 }).withMessage("Description is too long"),
  ];
};

const addMembertoProjectValidator = () => {
  return [
    body().custom((value, { req }) => {
      const hasUserId = Boolean(req.body?.userId);
      const hasMembersArray = Array.isArray(req.body?.members);
      if (!hasUserId && !hasMembersArray) {
        throw new Error("userId or members array is required");
      }
      return true;
    }),

    // single member payload
    body("userId").optional().isMongoId().withMessage("Invalid userId"),
    body("role")
      .optional()
      .isIn(AvailableUserRole)
      .withMessage("Invalid role"),

    // multiple members payload
    body("members").optional().isArray({ min: 1 }).withMessage("members must be an array"),
    body("members.*.userId")
      .optional()
      .isMongoId()
      .withMessage("Invalid userId in members"),
    body("members.*.role")
      .optional()
      .isIn(AvailableUserRole)
      .withMessage("Invalid role in members"),
  ];
};

export { createProjectValidator, addMembertoProjectValidator };