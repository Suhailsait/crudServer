const express = require('express')
const mongoose = require('mongoose')
const userRouter = require('./routes/user')
const dotenv = require("dotenv").config()
const app = express()
const cors = require('cors')

// const bodyParser = require('body-parser')
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended:true}))

app.use(cors({
    origin: 'http://localhost:4200'

}));

app.use(express.json())

mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB, {
    useNewUrlParser: true,
})
    .then(() => console.log("Database connection successfully"))
    .catch((err) => console.log("error connecting to mongodb", err));



app.use('/', userRouter)

app.listen(3000, () => {
    console.log('Server running on 3000');
})






// var sid = 'ACb9e9e35cbc63a1e1a5fa6bde4a029e4f'
// var authToken ='5ff0f4cd2e4be19c5dc7dc2170045350' 

// var twilio = require('twilio')(sid,auth_token)

// twilio.messages.create({
//     from:'+19137330345',
//     to:'+919567990559',
//     body:'Your OTP is 4566'
// }).then(message => console.log(message.status));

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
