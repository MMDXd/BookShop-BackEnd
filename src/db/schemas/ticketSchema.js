const { Schema, models, model, SchemaTypes } = require("mongoose")

const ticketSchema = new Schema({
    title: String,
    subject: String,
    createDate: Date,
    status: Boolean,
    creator: SchemaTypes.ObjectId
})


const ticket = models.ticket || model("ticket", ticketSchema)

module.exports = { ticket }