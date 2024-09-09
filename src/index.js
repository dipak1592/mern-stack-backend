// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
import connectDB from './db/index.js';

dotenv.config({
    path:"./env"
})

connectDB()




/*
import mongoose from 'mongoose'
import { DB_NAME } from './constants';
import express from 'express'

const app = express()
;(async () => {
    try{
       await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        app.on("error",(error) =>{
            console.log("error app is not connected to database:-",error)
            throw error
        })

        app.listen(process.env.PORT, () =>{
            console.log(`app is listning on port no:-${process.env.PORT}`)
        })
    }catch(error){
        console.log("error:-",error)
        throw error
    }
})()
*/