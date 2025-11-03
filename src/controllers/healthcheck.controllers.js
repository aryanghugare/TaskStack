import {ApiResponse} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import {asyncHandler} from "../utils/async-handler.js"
// This is a healthcheck controller without using asyncHandler

/*
const healthCheck = (req,res)=> {
try {
 res.status(200)
.json(new ApiResponse(200,{
message :"Healthcheck successful"
})
)
}
catch (error){
 res.status(404)
.json(new ApiError(404,"Healthcheck failed"))

}
}
*/ 
// This is a healthcheck controller using asyncHandler
const healthCheck = asyncHandler( async(req,res)=>{
res.status(200)
.json(new ApiResponse(200,{
message :"Healthcheck successful BB!"
})
)
})


export {healthCheck};