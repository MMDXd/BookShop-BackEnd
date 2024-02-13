const { setUserLogout, isUserLogin } = require("../utils/auth")

const Router = require("express").Router()

Router.get("/", async (req, res) => {
    if (await isUserLogin(req)) await setUserLogout(req)
    res.json({success: true})
})

module.exports = {
    version: 1,
    exec: Router,
    route: "logout"
}