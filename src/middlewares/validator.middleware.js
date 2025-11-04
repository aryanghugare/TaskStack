// What it does: This middleware checks for validation errors in the request using express-validator.
// The files are added here , here this file will extract the errors and will process them accordingly. 
// This file is reusable across different routes where validation is needed and also many other projects 

import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js"

export const validate = (req, res, next) => {
const errors = validationResult(req);
if(errors.isEmpty()){
return next();
}
const extractedErrors = [];
errors.array().map(err => extractedErrors.push(
{
[err.path]: err.msg //You Could also push the whole err object if you want more details
}
));
throw new ApiError(400, "Validation Error", extractedErrors);

}





