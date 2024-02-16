const { body } = require("express-validator")
const { ticket } = require("../db/schemas/ticketSchema")
const { isUserAdmin, checkIfUserLogin } = require("../utils/validator")
const { validateRequest } = require("../utils/validator")
const { ticketMessage } = require("../db/schemas/ticketMessageSchema")
const { getUserDataById } = require("../utils/auth")
const { isAllowToSendMessage, getTicketMessagesById, seenPastMessages, getTicketById, checkTicketSeen } = require("../utils/ticketManager")
const Router = require("express").Router()



Router.get("/", isUserAdmin, async (req, res) => {
    const tickets = await ticket.find().sort({ createDate: -1 })
    const returnTickets = []
    for (const ticket of tickets) returnTickets.push({_id: ticket._id, title: ticket.title, subject: ticket.subject, createDate: ticket.createDate, status: ticket.status, creator: ticket.creator, seen: await checkTicketSeen(ticket._id, true)})
    res.json({tickets: returnTickets})
})

Router.get("/myTickets", checkIfUserLogin, async (req, res) => {
    const tickets = await ticket.find({creator: req.session.user._id}).sort({ createDate: -1 })
    let returnTickets = []
    for (const ticket of tickets) returnTickets.push({_id: ticket._id, title: ticket.title, subject: ticket.subject, createDate: ticket.createDate, status: ticket.status, creator: ticket.creator, seen: await checkTicketSeen(ticket._id, true)})
    res.json({tickets: returnTickets})
})

Router.get("/:id", checkIfUserLogin, async (req, res) => {
    const foundTicket = await ticket.findById(req.params.id)
    if (!foundTicket) return res.status(404).json({message: "ticket not found", success: false})
    if (!await isAllowToSendMessage(foundTicket._id, req.session.user._id)) {
        return res.status(403).json({message: "you cant access to this page!", success: false})
    }
    const messages = await getTicketMessagesById(foundTicket._id)
    res.json({ticket: {_id: foundTicket._id, title: foundTicket.title, subject: foundTicket.subject, createDate: foundTicket.createDate, status: foundTicket.status, creator: foundTicket.creator, seen: await checkTicketSeen(foundTicket._id, true)}, messages})
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
    const ticketData = await getTicketById(id)
    if (!ticketData.status) return res.status(400).json({message: "this ticket is closed!", success: false})
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

Router.post("/:id/close", checkIfUserLogin, async (req, res) => {
    const {id} = req.params
    const userId = req.session.user._id
    if (!await isAllowToSendMessage(id, userId)) return res.status(403).json({message: "you cant access to this page!", success: false})
    await ticket.updateOne({_id: id}, {status: false})
    res.json({success: true})
})

Router.post("/:id/seen", checkIfUserLogin, async (req, res) => {
    const {id} = req.params
    const userId = req.session.user._id
    if (!await isAllowToSendMessage(id, userId)) return res.status(403).json({message: "you cant access to this page!", success: false})
    const {user} = await getUserDataById(userId)
    await seenPastMessages(id, user.isAdmin)
    res.json({success: true})
})



module.exports = {
    exec: Router,
    route: "ticket",
    version: 1
}