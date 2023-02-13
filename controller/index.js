const Other = require("./other")
const User = require('../models/user')
const bcrypt = require("bcrypt")
const randomstring = require("randomstring")


//_______________________________________________________________________________________________
//_____________________________________Sign UP API_______________________________________________
//_______________________________________________________________________________________________
const signup = async (req, res) => {

  try {
    const { username, email, phoneno , password} = req.body;
    const spassword = await Other.securePassword(password)
    const userData = await User.findOne({ email })
    if (userData) {
      res.status(402).send({ condition: false, message: "Already registered User...Please Log In" })
    } else {
      const user = new User({
        username: username,
        email: email,
        phoneno: phoneno,
        password: spassword
      });
      await user.save()
      const randomString = randomstring.generate()
      const data = await User.findOneAndUpdate({ email }, { $set: { useToken: randomString } })
      const text = 'Verify Your Account'
      const instruction = 'To verify your account, please click here:'
      const link = `http://localhost:3000/verify-user?useToken=${randomString}`
      await Other.sentMail(data.username, data.email, text, instruction, link)
      res.status(202).send({ condition: true, message: "Open the Email and Verify"})
    }
  } catch (error) {
    res.status(404).send({ condition: false, message: error.message })
  }
}
//_______________________________________________________________________________________________
//_____________________________________________Verify User_______________________________________
//_______________________________________________________________________________________________
const verifyUser = async (req, res) => {
  try {
    const token = req.query.useToken
    const userData = await User.findOneAndUpdate({ token }, {
      $set: {
        verified: true,
        token: ""
      }
    }, { new: true })
    if (userData) {
      res.status(202).send({ condition: true, message: "Your Account has been verified", data: userData })
    } else {
      res.status(402).send({ condition: false, message: "The Link has been expired" })
    }
  } catch (error) {
    res.status(404).send({ condition: false, message: error.message })
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
          res.status(402).send({ condition: false, message: "Please verify your Account on Email and Log In" })
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
        res.status(202).send({ condition: true, message: "Log In Successful", data: {userDetails,userData} })
      }
      }
      else {
        res.status(402).send({ condition: false, message: "Incorrect Password" })
      }
    } else {
      res.status(402).send({ condition: false, message: "Incorrect Email" })
    }

  } catch (error) {
    res.status(404).send({ condition: false, message: error.message })
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
        res.status(400).send({ status: false, message: "Use different password" })

      } else {

        const newPassword = await Other.securePassword(password)
        const userData = await User.findOneAndUpdate({ email }, {
          $set: {
            password: newPassword
          }
        })
        res.status(200).send({ condition: true, message: "Password changed successfully", data: userData })
      }

    } else {
      res.status(400).send({ condition: false, message: "User not Found" })
    }


  } catch (error) {
    res.status(404).send({ condition: false, message: error.message })
  }
}
//____________________________________________________________________________________________
//___________________________________________Forget-password API______________________________
//____________________________________________________________________________________________
const passwordForget = async (req, res) => {
  try {
    const { email } = req.body;
    const userData = await User.findOne({ email })
    console.log(userData);
    if (userData) {

      const randomString = randomstring.generate()
      const data = await User.findOneAndUpdate({ email }, { $set: { useToken: randomString } })
      const link = `http://localhost:3000/reset-password?useToken=${randomString}`
      const text = 'Reset Your Password'
      const instruction = 'To reset your password, please click here:'
      await Other.sentMail(userData.username, userData.email, text, instruction, link)
      res.status(200).send({ status: true, message: "Check your inbox", data: data })

    } else {
      res.status(400).send({ status: false, message: "User not Found" })

    }

  } catch (error) {
    res.status(404).send({ status: false, message: error.message })
  }
}
//_______________________________________________________________________________________________
//__________________________________________PasswordReset________________________________________
//_______________________________________________________________________________________________
const passwordReset = async (req, res) => {
  try {
    const token = req.query.useToken
    const password = req.body.password
    const newPassword = await Other.securePassword(password)
    const userData = await User.findOneAndUpdate({ token }, {
      $set: {
        password: newPassword,
        token: ""
      }
    }, { new: true })   
     if (userData) {
      
      res.status(202).send({ success: true, message: "Password has been reseted", data: userData })

    } else {
      res.status(402).send({ success: false, message: "The Link has been expired" })
    }

  } catch (error) {
    res.status(404).send({ status: false, message: error.message })
  }

}
//_____________________________________________________________________________________________________


// const token = Math.random().toString(36).substring(2);


module.exports = {
  signup,
  login,
  passwordChange,
  passwordForget,
  passwordReset,
  verifyUser
}