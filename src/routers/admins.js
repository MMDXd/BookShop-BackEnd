const { body, validationResult } = require("express-validator")
const { isUserLogin, getUserDataById } = require("../utils/auth")
const multer = require("multer")
const {book} = require("../db/schemas/bookSchema")
const Router = require("express").Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/data/bookImages')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        req.imagePath = file.fieldname + '-' + uniqueSuffix
        cb(null, req.imagePath)
    }
})


const bookImages = multer({storage})

Router.post("/newBook", [
    body("name").isString().notEmpty(),
    body("price").isInt(),
], async (req, res) => {
    if (!await isUserLogin(req)) {
        return res.status(401).json({login: false})
    }
    const { user } = await getUserDataById(req.session.user._id)
    if (!user.isAdmin) {
        return res.status(403).json({login: true, admin: false})
    }
    bookImages.single("single")(req, res, async (err) => {
        if (err) {
            return res.status(500).json({message: err})
        }
        let validate = validationResult(req)
        if (!validate.isEmpty()) {
            return res.status(400).json({message: validate.array({onlyFirstError: true})[0]})
        }
        const {name, price, filter} = req.body
        const addBook = new book({name, price, offer: 0, totalSells: 0, filter, imagePath: `/bookImages/${req.imagePath}`})
        await addBook.save()
    })
})


module.exports = {
    version: 1,
    route: "admins",
    exec: Router
}