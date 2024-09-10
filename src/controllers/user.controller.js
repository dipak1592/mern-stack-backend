import { asynchandler } from "../utils/asyncHandlers.js";

const registerUser  = asynchandler( async (req,res) =>{
    return res.status(200).json({
        message:"Dipak Dhariyaparmar"
    })
})

export {registerUser}