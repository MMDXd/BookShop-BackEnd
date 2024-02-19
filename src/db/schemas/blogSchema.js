const {Schema, SchemaTypes, models, model} = require("mongoose")

const blogSchema = new Schema({
    title: String,
    imagePath: String,
    description: String,
    author: SchemaTypes.ObjectId,
    tags: Array
})

const blog = models.blog || model("blog", blogSchema)

module.exports = {blog}