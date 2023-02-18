const Other = require("./other")
const User = require('../models/user')
const bcrypt = require("bcrypt")
const randomstring = require("randomstring")


//_______________________________________________________________________________________________
//_____________________________________Sign UP API_______________________________________________
//_______________________________________________________________________________________________
const signup = async (req, res) => {

  try {
    const { username, email, phoneno, password } = req.body;
    const spassword = await Other.securePassword(password)
    const userData = await User.findOne({ email })
    if (userData) {
      res.status(402).json({ message: "Already registered User...Please Log In" })

    } else {
      const OTP = Math.floor((Math.random() * 9000) + 1000);
      const expiryOTP = new Date(Date.now() + 60000);
      const user = new User({
        username: username,
        email: email,
        phoneno: phoneno,
        password: spassword,
        otp:OTP,
        otpExpires:expiryOTP
      });
      await user.save()
      const msg= `Your OTP for verification is : ${OTP}`
      const text = `${OTP}`
      const instruction = `Your OTP for verification is : `
      const link = ``
      Other.sms(user.phoneno,msg)
      Other.sentMail(user.username, user.email,text,instruction,link)
      res.status(202).json({ message: "OTP has been sent to your email and phone number Please Verify",data:user})
      setTimeout(async()=>{
        if (user.otp && user.otpExpires < Date.now()) {
          user.otp = "";
          user.otpExpires ="";
          await user.save();
          console.log('OTP deleted');
        }
      },60000);
    }
  } catch (error) {
    res.status(404).send(error.message)
    console.log(error.message);
  }
}
//_______________________________________________________________________________________________
//_____________________________________________Verify User_______________________________________
//_______________________________________________________________________________________________
const verifyUser = async (req, res) => {
  try {
    const id=req.query.id
    const otp= req.body.otp
    const userData = await User.findOne({ _id:id })
    if(userData){
      if (userData.otp==otp) {
        await User.updateOne({
           verified:true,
           otp:"",
           otpExpires:""
         })
 
       res.status(202).json({ message: "Your Account has been verified", data: userData })
     } else {
       res.status(402).json({ message: "Incorrect OTP" })
     }
    }else{
      res.status(403).json({ message: "No user found"})
    }
    
  } catch (error) {
    res.status(404).send(error.message)
  }
}
//_______________________________________________________________________________________________
//_____________________________________Resend_OTP API_______________________________________________
//_______________________________________________________________________________________________
const resend_OTP = async (req, res) => {

  try {
    const email =req.query.email
    const userDetails=await User.findOne({email})
    if (userDetails.otp !="") {
      res.status(402).json({ message: "Try After Some Time" })
    } else {
    const OTP = Math.floor((Math.random() * 9000) + 1000);
    const expiryOTP = new Date(Date.now() + 60000);
    const userData = await User.findOneAndUpdate({ email }, {
      $set: {
        otp:OTP,
        otpExpires:expiryOTP
      }
    })
    const msg= `Your OTP for verification is : ${OTP}`
    const text = `${OTP}`
    const instruction = `Your OTP for verification is : `
    const link = ``
    Other.sms(userData.phoneno,msg)
    Other.sentMail(userData.username, userData.email,text,instruction,link)
    res.status(202).json({ message: "OTP has been send"})
    setTimeout(async()=>{
      try {
        const data = await User.findOne({ email });
        if (data.otp && data.otpExpires < Date.now()) {
              data.otp="";
              data.otpExpires="";
              await data.save()
          console.log('OTP deleted');
          }
      } catch (error) {
        console.log('Error updating data:', error);
      }
      
    },60000);
  }
  } catch (error) {
    res.status(404).send(error.message)
    console.log(error.message);
  }
}
//_______________________________________________________________________________________________
//____________________________________________Login API__________________________________________
//_______________________________________________________________________________________________
const login = async (req, res) => {

  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email })
    if (userData) {
      const passwordmatch = await bcrypt.compare(password, userData.password)
      if (passwordmatch) {
        if (!userData.verified) {
          res.status(402).json({message: "Please verify your Account and Log In",data:userData })
        } else {
          const tokenData = await Other.create_token(userData._id)
          const userDetails = {
            id: userData._id,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            phoneno: userData.phoneno,
            token: tokenData
          }
          console.log(userDetails);
          res.status(202).json({ message: "Log In Successful", data: { userDetails, userData } })
        }
      }
      else {
        res.status(402).json({ message: "Incorrect Password" })
      }
    } else {
      res.status(402).json({ message: "Incorrect Email" })
    }

  } catch (error) {
    res.status(404).send(error.message)
  }
}
//____________________________________________________________________________________________
//__________________________________________Change Password___________________________________
//____________________________________________________________________________________________
const passwordChange = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await User.findOne({ email })
    if (data) {
      const passwordmatch = await bcrypt.compare(password, data.password)
      if (passwordmatch) {
        res.status(402).json({ message: "Use different password" })

      } else {

        const newPassword = await Other.securePassword(password)
        const userData = await User.findOneAndUpdate({ email }, {
          $set: {
            password: newPassword
          }
        })
        res.status(202).json({ message: "Password changed successfully", data: userData })
      }

    } else {
      res.status(402).json({ message: "User not Found" })
    }


  } catch (error) {
    res.status(404).send(error.message)
  }
}
//____________________________________________________________________________________________
//___________________________________________Forget-password API______________________________
//____________________________________________________________________________________________
const passwordForget = async (req, res) => {
  try {
    const { email } = req.body.email;
    const userData = await User.findOne({ email })
    console.log(userData);
    if (userData) {

      const randomString = randomstring.generate()
      const data = await User.findOneAndUpdate({ email }, { $set: { useToken: randomString } })
      const link = `http://localhost:4200/resetpassword?useToken=${randomString}`
      const text = 'Reset Your Password'
      const instruction = 'To reset your password, please click here:'
      await Other.sentMail(userData.username, userData.email, text, instruction, link)
      res.status(202).json({ message: "Check your inbox", data: data })

    } else {
      res.status(402).json({ message: "User not Found" })

    }

  } catch (error) {
    res.status(404).send(error.message)
  }
}
//_______________________________________________________________________________________________
//__________________________________________PasswordReset________________________________________
//_______________________________________________________________________________________________
const passwordReset = async (req, res) => {
  try {
    console.log(req.body)
    const token = req.query.token
    const password = req.body.password
    const newPassword = await Other.securePassword(password)
    const userData = await User.findOneAndUpdate({ useToken: token }, {
      $set: {
        password: newPassword,
        useToken: ""
      }
    }, { new: true })
    if (userData.useToken == "") {

      res.status(202).json({ message: "Password has been reseted", data: userData })

    } else {
      res.status(402).json({ message: "The Link has been expired" })
    }

  } catch (error) {
    res.status(404).send(error.message)
  }

}
//_____________________________________________________________________________________________________



module.exports = {
  signup,
  login,
  passwordChange,
  passwordForget,
  passwordReset,
  verifyUser,
  resend_OTP
}