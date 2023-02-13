const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()


const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers['Auth']
        if (token) {
            const data = await jwt.verify(token,process.env.SECRETJWT)
            req.user = data

        } else {
            res.status(401).send({ status: false, message: "Please Log In" })
        }
        return next();
    }
    catch (error) {
        res.status(400).send({message:"error occured",error})
    }
}

module.exports = verifyToken