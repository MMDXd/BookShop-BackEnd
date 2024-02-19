const { blog } = require("../db/schemas/blogSchema");
const {ObjectId} = require("mongoose").SchemaTypes

/**
 * 
 * @param {ObjectId} id
 * @returns {blog} 
 */
const findBlog = async (id) => {
    const blog = await blog.findById(id); 
    return blog
}

/**
 * @returns {Array<blog>}
 */
const getAllBlogs = async () => {
    return await blog.find()
}

/**
 * @param {ObjectId} id
 * @returns {Boolean}
 */
const deleteBlog = async (id) => {
    return (await blog.deleteOne({_id: id})).deletedCount >= 1
}

/**
 * 
 * @param {String} title 
 * @param {String} imagePath 
 * @param {String} description 
 * @param {ObjectId} author 
 * @param {Array} tags 
 */
const addBlog = async (title, imagePath, description, author, tags) => {
    const newBlog = new blog(title, imagePath, description, author, tags)
    await newBlog.save()
}





module.exports = {
    findBlog,
    getAllBlogs,
    addBlog,
    deleteBlog
}