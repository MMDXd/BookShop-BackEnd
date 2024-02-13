const express = require("express")
const { validationResult } = require("express-validator")

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



module.exports = { validateRequest }