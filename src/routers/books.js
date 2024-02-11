const { book } = require("../db/schemas/bookSchema")

const Router = require("express").Router()






Router.get("/", async (req, res) => {
    try {
        const sells = await book.find().sort({ totalSells: -1 })
        for (let index = 0; index < sells.length; index++) {
            if (index <= 4) {
                sells[index].filter = "topsells"
            }
        }
        res.json(sells)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


module.exports = {
    version: 1,
    route: "books",
    exec: Router,
}