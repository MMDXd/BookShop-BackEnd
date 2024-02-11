const {Schema, SchemaTypes, model} = require("mongoose")

const commentSchema = new Schema({
    sender: SchemaTypes.ObjectId,
    content: String
})


const comment = model("comment", commentSchema)

module.exports = { comment }