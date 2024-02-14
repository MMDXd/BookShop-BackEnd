const { body } = require("express-validator")
const { ticket } = require("../db/schemas/ticketSchema")
const { isUserAdmin, checkIfUserLogin } = require("../utils/validator")
const { validateRequest } = require("../utils/validator")
const { ticketMessage } = require("../db/schemas/ticketMessageSchema")
const { getUserDataById } = require("../utils/auth")
const { isAllowToSendMessage, getTicketMessagesById } = require("../utils/ticketManager")
const Router = require("express").Router()



Router.get("/", isUserAdmin, async (req, res) => {
    const tickets = await ticket.find().sort({ createDate: -1 })
    res.json({tickets})
})

Router.get("/myTickets", checkIfUserLogin, async (req, res) => {
    const tickets = await ticket.find({creator: req.session.user._id}).sort({ createDate: -1 })
    res.json({tickets})
})

Router.get("/:id", checkIfUserLogin, async (req, res) => {
    const foundTicket = await ticket.findById(req.params.id)
    if (!foundTicket) return res.status(404).json({message: "ticket not found"})
    res.json(foundTicket)
})

Router.post("/", checkIfUserLogin, [
    body("title").isString().notEmpty(),
    body("subject").isString().notEmpty(),
    body("message").isString().notEmpty(),
], validateRequest, async (req, res) => {
    const {title, subject, message} = req.body
    const {user} = await getUserDataById(req.session.user._id)
    const createdTicket = new ticket({title, subject, createDate: Date.now(), status: true, creator: user._id})
    await createdTicket.save()
    const firstMessage = new ticketMessage({
        content: message,
        sendTime: Date.now(),
        seen: false,
        author: user._id,
        isAdminMessage: user.isAdmin,
        ticket: createdTicket._id,
    })
    await firstMessage.save()
    res.json({success: true})
})

Router.put("/:id", checkIfUserLogin, [
    body("message").isString().notEmpty(),
], validateRequest, async (req, res) => {
    const {message} = req.body
    const {id} = req.params
    const userId = req.session.user._id
    if (!await isAllowToSendMessage(id, userId)) return res.status(403).json({message: "you cant access to this page!", success: false})
    const {user} = await getUserDataById(userId)
    const newMessage = new ticketMessage({
        content: message,
        sendTime: Date.now(),
        seen: false,
        author: user._id,
        isAdminMessage: user.isAdmin,
        ticket: id,
    })
    await newMessage.save()
    res.json({success: true})
})

Router.get("/messages/:id", checkIfUserLogin, async (req, res) => {
    const userId = req.session.user._id
    const {id: ticketId} = req.params
    if (!await isAllowToSendMessage(ticketId, userId)) {
        return res.status(403).json({message: "you cant access to this page!", success: false})
    }
    const messages = await getTicketMessagesById(ticketId)
    res.status(200).json({messages: messages, success: true})
})


module.exports = {
    exec: Router,
    route: "ticket",
    version: 1
}