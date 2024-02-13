const { User } = require("../db/schemas/userSchema")
const { getUserDataById, checkUserPassword } = require("../utils/auth")
const multer = require("multer")
const Router = require("express").Router()
const {unlinkSync} = require("fs")
const {join} = require("path")
const { body } = require("express-validator")
const { validateRequest, checkIfUserLogin } = require("../utils/validator")
const bcrypt = require("bcrypt")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(process.cwd(), "/data/userImages"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        req.profileImage = file.fieldname + '-' + uniqueSuffix
        cb(null, req.profileImage)
    }
})

const userImages = multer({storage})

Router.get("/mydata", checkIfUserLogin, async (req, res) => {
    const userdata = await getUserDataById(req.session.user._id)
    userdata.user.password = undefined
    userdata.user.salt = undefined
    return res.json({login: true, userdata: userdata.user})
})

Router.post("/mydata", userImages.single("image"), checkIfUserLogin, async (req, res) => {
    if (!req.body.email || !req.body.fullname) return res.status(400).json({message: "Invalid value"})
    const id = req.session.user._id
    const {user} = await getUserDataById(id)
    req.body.profileURL = user.profileURLPath
    if (req.file) {
        if (user.profileURLPath != "/userImages/noProfile.jpg") {
            try {
                console.log(join(process.cwd(), "/data", user.profileURLPath));
                unlinkSync(join(process.cwd(), "/data", user.profileURLPath))
            } catch {}
        }
        req.body.profileURL = `/userImages/${req.profileImage}`
    }
    const {email, fullname, job} = req.body
    await User.updateOne({_id: id}, {email, fullname, profileURLPath: req.body.profileURL, job})
    return res.json({success: true})
})

Router.put("/mydata/password", [
    body("currentpassword").isString().notEmpty(),
    body("password").isString().notEmpty(),
], validateRequest, checkIfUserLogin, async (req, res) => {
    const id = req.session.user._id
    const {user} = await getUserDataById(id)
    const {currentpassword, password} = req.body
    if ((await checkUserPassword(user.email, currentpassword)).valid) {
        const salt = bcrypt.genSaltSync()
        const hashPassword = bcrypt.hashSync(password, salt)
        await User.updateOne({_id: id}, {salt, password: hashPassword})
        return res.json({success: true})
    }
    return res.json({success: false})
})


module.exports = {
    version: 1,
    route: "userdata",
    exec: Router
}