const {Schema, SchemaTypes, models, model} = require("mongoose")

const productCommentSchema = new Schema({
    author: SchemaTypes.ObjectId,
    product: SchemaTypes.ObjectId,
    content: String,
    title: String
})

const productComment = models.productComment || model("productComment", productCommentSchema)


module.exports = {
    productComment
}