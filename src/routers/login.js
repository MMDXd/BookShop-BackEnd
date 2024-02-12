const Router = require("express").Router()
const {body, validationResult} = require("express-validator")
const { checkUserPassword, setUserLogin, getUserDataByEmail } = require("../utils/auth")


const loginValidate = [
    body("email").isEmail(),
    body("password").isString().notEmpty(),
] 

Router.post("/", loginValidate, async (req, res) => {
    let validate = validationResult(req)
    if (!validate.isEmpty()) {
        return res.status(400).json({message: validate.array({onlyFirstError: true})[0]})
    }
    const {email, password} = req.body
    if (!(await getUserDataByEmail(email)).valid) {
        return res.json({valid: false})
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