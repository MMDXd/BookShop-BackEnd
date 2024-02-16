const { compareSync } = require("bcrypt");
const {unlinkSync} = require("fs")
const {join} = require("path")
const {User} = require("../db/schemas/userSchema");
const {ObjectId} = require("mongoose").SchemaTypes
const { ticket } = require("../db/schemas/ticketSchema")
const { ticketMessage } = require("../db/schemas/ticketMessageSchema")
/**
 * 
 * @param {import("express").Request} req 
 * @returns {Boolean} isLogin
 */
const isUserLogin = async (req) => {
    return (req.session.isLogin && (await User.findById(req.session.user._id)) && true) || false
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {ObjectId} _id 
 * @returns {Boolean} success
 */
const setUserLogin = async (req, _id) => {
    const user = await User.findById(_id)
    if (!user) return false
    req.session.isLogin = true
    req.session.user = {_id: user._id}
    await req.session.resetMaxAge()
    await req.session.save()
    return true
}

/**
 * 
 * @param {import("express").Request} req 
 */
const setUserLogout = (req) => {
    req.session.isLogin = false
    delete req.session.user
    req.session.save()
}

/**
 * 
 * @param {String} email 
 * @param {String} password 
 * @returns {{valid: Boolean, user: object}} valid
 */
const checkUserPassword = async (email, password) => {
    const user = await User.findOne({email})
    
    if (!user) return {valid: false}

    if (!compareSync(password, user.password)) return {valid: false}
    return {valid: true, user}
}

/**
 * 
 * @param {String} email 
 * @returns {{valid: Boolean, user: object}} valid
 */
const getUserDataByEmail = async (email) => {
    const user = await User.findOne({email})
    
    if (!user) return {valid: false}

    return {valid: true, user}
}

/**
 * 
 * @param {ObjectId} id 
 * @returns {{valid: Boolean, user: object}} valid
 */
const getUserDataById = async (id) => {
    const user = await User.findById(id)
    
    if (!user) return {valid: false}

    return {valid: true, user}
}

/**
 * 
 * @param {ObjectId} id 
 * @returns {Boolean}
 */
const deleteUser = async (id) => {
    const userdata = await getUserDataById(id)
    if (!userdata.valid) return false
    try {
        unlinkSync(join(process.cwd(), "/data", userdata.user.profileURLPath))
    } catch {}
    const deleted = await User.deleteOne({_id: id})
    
    // delete user tickets
    try {
        for (const userTicket of await ticket.find({creator: id})) {
            await ticketMessage.deleteMany({ticket: userTicket._id})
            await ticket.deleteOne({_id: userTicket._id})
        }
    }
    catch (e) {console.log(e)} 

    return deleted.deletedCount >= 1
}

/**
 * 
 * @param {ObjectId} id
 * @returns {Boolean}
 */
const setUserAdmin = async (id) => {
    const userdata = await getUserDataById(id)
    if (!userdata.valid) return false
    const updated = await User.updateOne({_id: id}, {isAdmin: true})
    return updated.modifiedCount >= 1
}

/**
 * 
 * @param {ObjectId} id
 * @returns {Boolean}
 */
const removeAdminPerm = async (id) => {
    const userdata = await getUserDataById(id)
    if (!userdata.valid) return false
    const updated = await User.updateOne({_id: id}, {isAdmin: false})
    return updated.modifiedCount >= 1
}


module.exports = {
    isUserLogin,
    setUserLogin,
    checkUserPassword,
    setUserLogout,
    getUserDataByEmail,
    getUserDataById,
    deleteUser,
    setUserAdmin,
    removeAdminPerm
}