const { getAllBlogs, findBlog, addBlog, deleteBlog } = require("../utils/blogManager")
const multer = require("multer")
const { checkIfUserLogin } = require("../utils/validator")
const {join} = require("path")
const { unlinkSync } = require("fs")
const Router = require("express").Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(process.cwd(), "/data/blogImages"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        req.imagePath = file.fieldname + '-' + uniqueSuffix
        cb(null, req.imagePath)
    }
})
const blogImages = multer({storage})

Router.get("/", async (req, res) => {
    res.json({blogs: await getAllBlogs()})
})
Router.get("/:id", async (req, res) => {
    res.json({blog: await findBlog(req.params.id)})
})

Router.post("/", checkIfUserLogin, blogImages.single("image"), async (req, res) => {
    const {title, description, tags} = req.body
    if (!title || !description || !tags) return res.status(400).json({message: "Invalid value"})
    await addBlog(title, req.imagePath, description, req.session.user._id, tags)
    res.json({success: true})
})

Router.delete("/:id", checkIfUserLogin, async (req, res) => {
    const userId = req.session.user._id
    const blogId = req.params.id
    const foundBlog = await findBlog(blogId)
    if (!foundBlog) return res.status(404).json({success: false})
    if (foundBlog.author.toString() != userId) return res.status(403).json({success: false})
    const deleted = await deleteBlog(blogId)
    if (!deleted) return res.json({success: false})
    try {
        unlinkSync(join(process.cwd(), '/data', foundBlog.imagePath))
    } catch{}
    res.json({success: true})
})



module.exports = {
    exec: Router,
    route: "/blog",
    version: 1
}