const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    email: String,
    password: String,
    fullname: String,
    phone_number: Number,
    isAdmin: Boolean
})

let User = modelNames().includes("User")?model("User"):model("User", userSchema)

module.exports = { User }