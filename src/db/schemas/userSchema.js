const {Schema, model, models} = require("mongoose")
const bcrypt = require("bcrypt")


const userSchema = new Schema({
    email: String,
    password: String,
    salt: String,
    fullname: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    profileURLPath: {
        type: String,
        default: "/userImages/noProfile.jpg"
    },
    job: {
        type: String,
        default: "Not Set"
    },
})

userSchema.pre("save", async function(next) {
    this.salt = await bcrypt.genSalt();
    this.password = bcrypt.hashSync(this.password, this.salt)
    next()
})


let User = models.User || model("User", userSchema)

module.exports = { User }