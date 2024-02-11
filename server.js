const express = require("express")
const {join} = require("path")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const app = express()
// initialize database
require("./src/db")


// middlewares
app.use("/bookImages", express.static(join(process.cwd(), "./data/bookImages")))
app.use("/userImages", express.static(join(process.cwd(), "./data/userImages")))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))

// session
const GStore = MongoStore.create({
    client: mongoose.connection.getClient(),
    collectionName: "sessions",
    stringify: false,
    autoRemove: "interval",
    autoRemoveInterval: 1,
  });
app.use(session({
    secret: "HiImSoSecureYouCantHackMyComputer:)",
    cookie: {maxAge: (24 * (60 * (60 * 1000)))},
    resave: false,
    saveUninitialized: true,
    store: GStore
}))
// load routers
require("./src/utils/routerApiLoader")(app)


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("listening on port " + port);
})