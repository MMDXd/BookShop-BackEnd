const Router = require("express").Router()
const {body} = require("express-validator")
const { User } = require("../db/schemas/userSchema")
const { validateRequest } = require("../utils/validator")

const registerFields = [
    body("email").isEmail(),
    body("password"),
    body("fullname").isString().notEmpty(),
]

Router.post("/", registerFields, validateRequest, async (req, res) => {
    const {email, fullname, password} = req.body
    if (await User.findOne({email})) {
        return res.status(400).json({message: "duplicate email"})
    }
    const user = new User({email, fullname, password})
    await user.save()
    res.status(200).json({message: "created successfully"})
})

module.exports = {
    version: 1,
    route: "register",
    exec: Router
}