const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    email: String,
    password: String,
    fullname: String,
    phone_number: Number,
    isAdmin: Boolean,
    profileURLPath: {
        type: String,
        default: "/userImages/noProfile.jpg"
    },
    job: {
        type: String,
        default: "Not Set"
    },
})

let User = model("User", userSchema)

module.exports = { User }