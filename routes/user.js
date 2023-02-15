const user_control = require('../controller/index')
const express = require('express')
const router = express.Router();
const auth = require("../middleware/auth")




router.post('/signup',user_control.signup)

router.post('/verify-user',user_control.verifyUser)

router.post('/login',user_control.login)

router.post('/change-password',auth,user_control.passwordChange)

router.post('/forget-password',user_control.passwordForget)

router.post('/reset-password',user_control.passwordReset)

// const accountSid = "ACfb7c49ff9fdc4016ba26be9a66fc67e5";
// const authToken = "23fb438a07d7d26dd7e0a0328f0b4bca";
// const verifySid = "VA0c85ce728df44ff008921fc380b414e3";
// const client = require("twilio")(accountSid, authToken);

// router.post('/mobile',(req,res)=>{
//     client.verify.v2
//     .services(verifySid)
//     .verifications.create({ to:`+91${req.body.number}`, channel: "sms" })
//     .then((response) => {
//         console.log("response",response)
//         res.status(200).json({response})
//     })
// })

// router.post('/otp',(req,res)=>{
//     const {otp} = req.body.otp
//     client.verify.v2
//     .services(verifySid)
//     .verificationsChecks.create({ to:`+91${req.body.number}`, code:otp })
//     .then((response) => {
//         console.log("otp received",response)
//         res.status(200).json({response})
//     })
// })








module.exports = router;