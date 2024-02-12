const { isUserLogin, getUserDataById } = require("../utils/auth")

const Router = require("express").Router()

Router.get("/mydata", async (req, res) => {
    const login = await isUserLogin(req)
    if (!login) {
        return res.status(401).json({login: false})
    }
    const userdata = await getUserDataById(req.session.user._id)
    userdata.user.password = undefined
    userdata.user.salt = undefined
    return res.json({login: true, userdata: userdata.user})
})


module.exports = {
    version: 1,
    route: "userdata",
    exec: Router
}