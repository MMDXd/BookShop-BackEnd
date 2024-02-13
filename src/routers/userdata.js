const { User } = require("../db/schemas/userSchema")
const { isUserLogin, getUserDataById } = require("../utils/auth")
const multer = require("multer")
const Router = require("express").Router()
const {unlinkSync} = require("fs")
const {join} = require("path")
const { body } = require("express-validator")
const { validateRequest } = require("../utils/validator")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/data/userImages")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        req.profileImage = file.fieldname + '-' + uniqueSuffix
        cb(null, req.profileImage)
    }
})

const userImages = multer({storage})

Router.get("/mydata", async (req, res) => {
    const login = await isUserLogin(req)
    if (!login) {
        return res.status(401).json({login: false})
    }
    const userdata = await getUserDataById(req.session.user._id)
    userdata.user.password = undefined
    userdata.user.salt = undefined
    return res.json({login: true, userdata: userdata.user})
})

Router.put("/mydata", [
    body("fullname").isString().notEmpty(),
    body("email").isEmail(),
], validateRequest, async (req, res) => {
    const login = await isUserLogin(req)
    if (!login) {
        return res.status(401).json({login: false, success: false})
    }
    const id = req.session.user._id
    const {user} = await getUserDataById(id)
    req.body.profileURL = user.profileURLPath
    if (req.files?.image) {
        if (user.profileURLPath != "/userImages/noProfile.jpg") {
            try {
                unlinkSync(join(process.cwd(), "/data", user.profileURLPath))
            } catch {}
        }
        req.body.profileURL = await new Promise(resolve => {
            userImages.single("image")(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({message: err, success: false})
                }
                resolve(`/userImages/${req.profileImage}`)
            })

        })
    }
    const {name, email, fullname} = req.body
    await User.updateOne({_id: id}, {name, email, fullname, profileURLPath: req.body.profileURL})
    return res.json({success: true})
})


module.exports = {
    version: 1,
    route: "userdata",
    exec: Router
}