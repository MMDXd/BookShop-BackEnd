const {Schema, SchemaTypes, model, models} = require("mongoose")

const commentSchema = new Schema({
    sender: SchemaTypes.ObjectId,
    content: String
})


const comment = models.comment || model("comment", commentSchema)

module.exports = { comment }