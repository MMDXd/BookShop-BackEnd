const { compareSync } = require("bcrypt");
const {User} = require("../db/schemas/userSchema");
const {ObjectId} = require("mongoose").SchemaTypes
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
    req.session.user = user
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
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @description Middleware for checking if user is admin
 */
const isUserAdmin = async (req, res, next) => {
    if (!await isUserLogin(req)) {
        return res.status(401).json({login: false, success: false})
    }
    const { user } = await getUserDataById(req.session.user._id)
    if (!user.isAdmin) {
        return res.status(403).json({login: true, admin: false})
    }
    next()
}


module.exports = {
    isUserLogin,
    setUserLogin,
    checkUserPassword,
    setUserLogout,
    getUserDataByEmail,
    getUserDataById,
    isUserAdmin
}