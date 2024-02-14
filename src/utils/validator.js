const express = require("express")
const { validationResult } = require("express-validator")
const { isUserLogin, getUserDataById } = require("./auth")

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const validateRequest = (req, res, next) => {
    let validate = validationResult(req)
    if (!validate.isEmpty()) {
        return res.status(400).json({message: validate.array({onlyFirstError: true})[0]})
    }
    next()
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
*/
const checkIfUserLogin = async (req, res, next) => {
    const login = await isUserLogin(req)
    if (!login) {
        return res.status(401).json({login: false, success: false})
    }
    next()
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
    validateRequest,
    checkIfUserLogin,
    isUserAdmin
}