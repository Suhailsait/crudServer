const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneno: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    useToken: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    otpExpires: {
        type: Date,
        default:''
    },
    verified: {
        type: Boolean,
        default: 'false'
    }
}, { timestamps: true })



module.exports = User = mongoose.model('User', userSchema)