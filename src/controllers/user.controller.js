import { asynchandler } from "../utils/asyncHandlers.js";
import {apierror} from "../utils/apierror.js";
import {User} from "../models/user.model.js";
import { uploadcloudinary } from '../utils/cloudinary.js';
import { apiResponse } from "../utils/apiResponse.js";
import { json } from "express";
import jwt from "jsonwebtoken";
// import  jwt  from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async(userId) =>{
    try {
        const user =  await User.findById(userId)

        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new apierror(500,"Internal Server Error")
    }
}

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

    // console.log("email is :-",req.body);

   if(
    [fullname, email, username, password].some((field) =>
        field?.trim() === "")
   ){
    throw apierror(400,"All fields are required")
   }
   const existeduser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existeduser){
        throw new apierror(409, "this username and email is already exist")
    }

    const avatarLocalpath = req.files?.avatar[0]?.path;
    // console.log(req.files);
    
    let coverImageLocalpath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalpath = req.files.coverImage[0].path
    }
    // const coverImageLocalpath =   req.files?.coverImage[0]?.path;

    if (!avatarLocalpath) {
            throw new apierror(400, "Avatar file is required")
    }

    const avatar = await uploadcloudinary(avatarLocalpath);

    const coverImage = await uploadcloudinary(coverImageLocalpath);

    if(!avatar){
        throw new apierror(400, "Avatar file is required")
    }

    // const refreshToken = jwt.sign(
    //     { _id: user._id },
    //     process.env.REFRESH_TOKEN_SECRET,
    //     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    // );

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),  
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apierror(500,"Internal server error")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser,"user registerd successfully")
    )
})

const loginuser = asynchandler(async (req,res) =>{
    // req body -data
    // username and email
    // find the user
    // check password
    // access and refresh token 
    // send cookie

    const {username, email, password} =  req.body

    console.log(email,username,password);
    
    if(!(username || email)){
        throw new apierror(400,"username or password is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new apierror(404,"user or email does not exist")
    }

    const isPasswordValid =  await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apierror(401,"password incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await  User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User loggedIn Successfully"
        )
    )
})


const logoutUser = asynchandler(async(req,res) =>{
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new apiResponse(200,{},"User Loggedout Successfullys"))
})


const refreshAccessToken = asynchandler(async(re,res) =>{
    const incomingrefreshToken =  req.cookie.refreshToken ||  req.body.refreshToken

    if (incomingrefreshToken) {
        throw new apierror(401,"Unauthorized error")
    }

    try {
        const decodedToken = jwt.verify(
            incomingrefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apierror(401,"Invalid refresh token")
        }
    
        if(incomingrefreshToken !== user?.refreshToken){
            throw new apierror(401,"refresh token is expired or used")
        }
    
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} =  await generateAccessTokenAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", newRefreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken },
                "access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new apierror(401, error?.message || "invalid refresh token")
    }
})
export {registerUser,loginuser,logoutUser,refreshAccessToken}