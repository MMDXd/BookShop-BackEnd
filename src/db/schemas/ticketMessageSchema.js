const { Schema, models, model, SchemaTypes } = require("mongoose")

const ticketMessageSchema = new Schema({
    author: SchemaTypes.ObjectId,
    ticket: SchemaTypes.ObjectId,
    content: String,
    sendTime: Date,
    seen: Boolean,
    isAdminMessage: Boolean
})


const ticketMessage = models.ticketMessage || model("ticketMessage", ticketMessageSchema)

module.exports = { ticketMessage }