const { book } = require("../db/schemas/bookSchema")
const { body } = require("express-validator")
const { isUserAdmin } = require("../utils/auth")
const multer = require("multer")
const {unlinkSync} = require("fs")
const {join} = require("path")
const { validateRequest } = require("../utils/validator")
const Router = require("express").Router()






Router.get("/", async (req, res) => {
    try {
        const sells = await book.find().sort({ totalSells: -1 })
        for (let index = 0; index < sells.length; index++) {
            if (index <= 4) {
                sells[index].filter = "topsells"
            }
        }
        res.json(sells)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

Router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const book = await book.findById(id)
        if (!book) return res.status(404).json({message: "book not found!"})
        res.json({book})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

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

Router.post("/", [
    body("name").isString().notEmpty(),
    body("price").isInt(),
], isUserAdmin, validateRequest, async (req, res) => {
    bookImages.single("image")(req, res, async (err) => {
        if (err) {
            return res.status(500).json({message: err})
        }
        const {name, price, filter} = req.body
        const addBook = new book({name, price, offer: 0, totalSells: 0, filter, imagePath: `/bookImages/${req.imagePath}`})
        await addBook.save()
        res.json({success: true})
    })
})

Router.put("/", [
    body("name").isString().notEmpty(),
    body("price").isInt(),
    body("offer").isInt(),
    body("id").isMongoId(),
], isUserAdmin, validateRequest, async (req, res) => {
    const {name, price, offer, id, filter} = req.body
    const currentBook = await book.findById(id)
    if (!currentBook) return res.status(404).json({message: "book not found", success: false})
    let imagePath
    if (req.files.image) {
        try {
            unlinkSync(join(process.cwd(), '/data', currentBook.imagePath))
        } catch {}
        imagePath = await new Promise(resolve => {
            bookImages.single("image")(req, res, async (err) => {
                if (err) {
                    return res.status(500).json({message: err, success: false})
                }
                resolve(`/bookImages/${req.imagePath}`)
            })
        })
    }
    await book.updateOne({_id: id}, {name, price, offer, filter, imagePath})
    res.json({success: true})
})

Router.delete("/", [
    body("id").isMongoId(),
], isUserAdmin, async (req, res) => {
    book.deleteOne({_id: req.body.id}).then(delRes => {
        if (delRes.deletedCount >= 1) {
            return res.json({success: true})
        }
        return res.json({success: false})
    }).catch(err => {
        console.log(err)
        res.status(500).json({success: false})
    })
})



module.exports = {
    version: 1,
    route: "books",
    exec: Router,
}