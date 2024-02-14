const { ticket } = require("../db/schemas/ticketSchema")
const { ticketMessage } = require("../db/schemas/ticketMessageSchema")
const { getUserDataById } = require("./auth")

const {ObjectId} = require("mongoose").SchemaTypes


/**
 * 
 * @param {ObjectId} id 
 * @returns {ticket}
 */
const getTicketById = async (id) => {
    const foundTicket = await ticket.findById(id)
    return foundTicket
}

/**
 * 
 * @param {ObjectId} ticketId 
 * @returns {Array<ticketMessage>}
 */
const getTicketMessagesById = async (ticketId) => {
    const foundMessages = await ticketMessage.find({ticket: ticketId}).sort({ sendTime: 1 })
    return foundMessages
}


/**
 * 
 * @param {ObjectId} ticketId 
 * @param {ObjectId} userId 
 * @returns {Boolean}
 */
const isAllowToSendMessage = async (ticketId, userId) => {
    const {user} = await getUserDataById(userId)
    if (user.isAdmin) return true
    const ticket = await getTicketById(ticketId)
    if (!ticket) return false
    if (ticket.creator == user._id) return true
    return false
}


module.exports = {
    getTicketById,
    isAllowToSendMessage,
    getTicketMessagesById
}