const express = require("express")
const { validationResult } = require("express-validator")
const { isUserLogin } = require("./auth")

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


module.exports = {
    validateRequest,
    checkIfUserLogin
}