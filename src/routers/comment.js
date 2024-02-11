const { comment } = require("../db/schemas/commentSchema")
const { User } = require("../db/schemas/userSchema")

const Router = require("express").Router()


Router.get("/", async (req, res) => {
    try {
        const comments = await comment.find()
        const fetchedComments = []
        for (const _comment of comments) {
            const author = await User.findById(_comment.sender)
            fetchedComments.push({content: _comment.content, profilePath: author.profileURLPath, job: author.job, name: author.fullname})
        }
        res.json(fetchedComments)
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = {
    version: 1,
    route: "comments",
    exec: Router
}