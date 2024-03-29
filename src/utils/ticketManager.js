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
 * @param {Boolean} seenAdminMessages 
 */
const seenPastMessages = async (ticketId, seenAdminMessages = false) => {
    await ticketMessage.updateMany({ticket: ticketId, isAdminMessage: seenAdminMessages, seen: false}, {seen: true})
}

/**
 * 
 * @param {ObjectId} ticketId 
 * @param {Boolean} isAdminRequest 
 * @returns {Boolean}
 */
const checkTicketSeen = async (ticketId, isAdminRequest = false) => {
    const foundTicket = await getTicketById(ticketId)
    if (!foundTicket) return true
    const ticketMessages = await getTicketMessagesById(ticketId)
    if (!ticketMessages) return true
    const lastMessage = ticketMessages.pop()

    if (lastMessage.isAdminMessage == isAdminRequest) return true
    if (lastMessage.isAdminMessage && !isAdminRequest && !lastMessage.seen) return false
    if (!lastMessage.isAdminMessage && !isAdminRequest) return true
    if (!lastMessage.isAdminMessage && isAdminRequest && !lastMessage.seen) return false
    return true
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
    const foundTicket = await getTicketById(ticketId)
    if (!foundTicket) {
        return false
    }
    if (foundTicket.creator.toString() == user._id.toString()) {
        return true
    }
    return false
}


module.exports = {
    getTicketById,
    isAllowToSendMessage,
    getTicketMessagesById,
    seenPastMessages,
    checkTicketSeen
}