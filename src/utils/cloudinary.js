import { v2 as cloudinary } from "cloudinary";

import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

const uploadcloudinary = async (localFilePath) =>{
    try {
        if (!localFilePath) return null

        //upload the file to cloudinary

       const response =  await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })

        //file hase been uploaded successfully
        //  console.log("file uploaded successfully on cloudinary",response)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

export {uploadcloudinary}