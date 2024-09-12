import { User } from "../models/user.model.js";
import { apierror } from "../utils/apierror.js";
import { asynchandler } from "../utils/asyncHandlers.js";
import  jwt  from "jsonwebtoken";

export const verifyJWT = asynchandler(async(req, _,next) =>{
   try {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
    if(!token){
         throw new apierror(401,"Unauthorized request")
    }
 
   const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
 
   if(!user){
     throw new apierror(401,"Invalid Access Token")
   }
 
   req.user = user;
   next()
   } catch (error) {
        throw new apierror(401,error?.message || "Invalid access token")
   }
})