const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    email: String,
    password: String,
    fullname: String,
    phone_number: Number,
    isAdmin: Boolean
})

let User = model("User", userSchema)

module.exports = { User }