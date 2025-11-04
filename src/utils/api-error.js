class ApiError extends Error {
constructor(
 statusCode, // Keep the order of parameters same in every project
message="Something went wrong",
errors=[],
stack = ""
) 
{
super(message); // Call the parent class constructor
this.statusCode = statusCode;
this.message = message;
this.data = null;
this.success = false;
this.errors = errors;

if(stack){
this.stack = stack;
}
else {
Error.captureStackTrace(this, this.constructor);
}

}


}

export {ApiError};