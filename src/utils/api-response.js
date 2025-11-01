// Standardized API Response Class

class ApiResponse{
constructor(statusCode,data, message="Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success= statusCode < 400;
// this status code less than 400 indicates success
  }

}

export {ApiResponse};