const Router = require("express").Router()
const {body} = require("express-validator")
const { checkUserPassword, setUserLogin, getUserDataByEmail } = require("../utils/auth")
const { validateRequest } = require("../utils/validator")


const loginValidate = [
    body("email").isEmail(),
    body("password").isString().notEmpty(),
] 

Router.post("/", loginValidate, validateRequest, async (req, res) => {
    const {email, password} = req.body
    if (!(await getUserDataByEmail(email)).valid) {
        return res.json({valid: false, success: false})
    }
    const login = await checkUserPassword(email, password)
    
    if (login.valid && setUserLogin(req, login.user._id)) {
        return res.json({success: true})
    }
    return res.json({success: false})
})

module.exports = {
    version: 1,
    route: "login",
    exec: Router
}