const { book } = require("../db/schemas/bookSchema")
const { body } = require("express-validator")
const { isUserAdmin } = require("../utils/validator")
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
        const foundBook = await book.findById(id)
        if (!foundBook) return res.status(404).json({message: "book not found!"})
        res.json({foundBook})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(process.cwd(), "/data/bookImages"))
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
], isUserAdmin, bookImages.single("image"), async (req, res) => {
    const {name, price, filter} = req.body
    if (!name || !price) return res.status(400).json({message: "Invalid value"})
    const addBook = new book({name, price, offer: 0, totalSells: 0, filter, imagePath: `/bookImages/${req.imagePath}`})
    await addBook.save()
    res.json({success: true})
})

Router.post("/newImage", body("id").isMongoId(), isUserAdmin, bookImages.single("image"), async (req, res) => {
    const id = req.body.id
    if (!id) return res.status(400).json({message: "id is required", success: false})
    const currentBook = await book.findById(id)
    if (!currentBook) return res.status(404).json({message: "book not found", success: false})
    if (req.file) {
        try {
            unlinkSync(join(process.cwd(), '/data', currentBook.imagePath))
        } catch {}
        await book.updateOne({_id: id}, {imagePath: `/bookImages/${req.imagePath}`})
        return res.json({success: true})
    }
    res.json({success: false})
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
    await book.updateOne({_id: id}, {name, price, offer, filter})
    res.json({success: true})
})

Router.delete("/", [
    body("id").isMongoId(),
], isUserAdmin, async (req, res) => {
    const id = req.body.id
    const currentBook = await book.findById(id)
    if (!currentBook) return res.status(404).json({message: "book not found", success: false})
    try {
        unlinkSync(join(process.cwd(), '/data', currentBook.imagePath))
    } catch{}
    book.deleteOne({_id: id}).then(delRes => {
        console.log(delRes);
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