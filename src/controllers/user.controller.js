import { asynchandler } from "../utils/asyncHandlers.js";
import {apierror} from "../utils/apierror.js"
import {user} from "../models/user.model.js"
import { uploadcloudinary } from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";

const registerUser  = asynchandler( async (req,res) =>{
    // get user detail for front-end
    // validation -not empty
    // check if user already exit or not using username or email
    // check for images, check for avatar 
    // upload them to cloudinary,avatar
    // create user object - create entry in db
    // remove pssword and refresh token field from response 
    // check for user creation
    // return res 

    const {fullname, email, username, password } = req.body

    console.log("email is :-",email);

   if(
    [fullname, email, username, password].some((field) =>
        field?.trim() === "")
   ){
    throw apierror(400,"All fields are required")
   }
   const existeduser =user.findOne({
        $or: [{ username }, { email }]
    })

    if(existeduser){
        throw new apierror(409, "this username and email is already exist")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path;
    const coverImageLocalpath =   req.files?.coverImage[0]?.path;

    if (!avatarLocalpath) {
            throw new apierror(400, "Avatar file is required")
    }

    const avatar = await uploadcloudinary(avatarLocalpath);

    const coverImage = await uploadcloudinary(coverImageLocalpath);

    if(!avatar){
        throw new apierror(400, "Avatar file is required")
    }

    const user = await user.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),

    })

    const createdUser = await user.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apierror(500,"Internal server error")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser,"user registerd successfully")
    )
})

export {registerUser}