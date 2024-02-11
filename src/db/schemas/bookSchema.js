const { Schema, model, modelNames, models } = require("mongoose")
const bookSchema = new Schema({
    totalSells: Number,
    price: Number,
    offer: Number,
    name: String,
    imagePath: String,
    filter: String
})

const book = models.book || model("book", bookSchema)


module.exports = {book}