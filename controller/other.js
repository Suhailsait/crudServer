
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer")
const randomstring = require("randomstring")
const mailgen = require("mailgen")
const dotenv = require("dotenv").config()



//create token_________________________________
const create_token = async (id) => {
    try {
      const token = await jwt.sign({ id }, process.env.SECRETJWT)
      return token
    }
    catch (error) {
      res.status(400).send(err.message);
    }
  }

//encryption___________________________________
const securePassword = async (password) => {
    try {
      const passwordSalt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, passwordSalt)
      return passwordHash;
  
    } catch (error) {
      res.status(404).send(error.message)
    }
  }

//resetMail____________________________________
const sentMail = async (name, email, text, instruction, link) => {
    try {
  
      let config = {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        }
      }
  
      let transporter = nodemailer.createTransport(config)
      let mailGenerator = new mailgen({
        theme: "default",
        product: {
          name: "CRUD",
          link: "https://mailgen.js/"
        }
      })
  
      let response = {
        body: {
          name: name,
          intro: "Welcome to CRUD Operation",
          action: {
            instructions: instruction,
            button: {
              color: '#22BC66',
              text: text,
              link: link
            }
          },
          outro: "Have a nice day",
          signature: "Thank you",
          greeting: false
        }
      }
  
      let mail = mailGenerator.generate(response)
  
      let message = {
        from: process.env.EMAIL,
        to: email,
        subject: text,
        html: mail
      }
  
      transporter.sendMail(message, function (error, info) {
        if (error) {
          console.log(error)
        }
        else {
          console.log("Mail has been sent :-", info.response)
        }
      })
  
    } catch (error) {
      res.status(404).send({ status: false, message: error.message })
    }
  }

  module.exports = {
    create_token,securePassword,sentMail
  }