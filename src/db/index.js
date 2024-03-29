const mongoose = require("mongoose")
const {join} = require("path")
const {readdirSync} = require("node:fs")

// connect to mongodb
mongoose.connect(process.env.DB_PATH || process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bookshop").then(() => console.log("Connected to Mongo DB")).catch(() => console.error("failed to connect to Mongo"))


// load schemas
const schemasPath = join(__dirname, "schemas");
readdirSync(schemasPath).filter(val => val.endsWith(".js")).forEach(file => {
    require(join(schemasPath, file))
    console.log(file, "loaded");
})


module.exports = mongoose