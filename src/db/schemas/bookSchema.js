const { Schema, model, modelNames } = require("mongoose")

const bookSchema = new Schema({
    totalSells: Number,
    price: Number,
    offer: Number,
    name: String,
    imagePath: String,
    filter: String
})

const book = modelNames().includes("book")?model("book"):model("book", bookSchema)


module.exports = {book}