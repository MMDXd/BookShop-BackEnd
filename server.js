const express = require("express")
const {join} = require("path")
const session = require("express-session")
const MongoStore = require("connect-mongo");
const { default: mongoose } = require("mongoose");
const cors = require("cors");
const app = express()
app.use(cors());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});
// initialize database
require("./src/db")


// middlewares
app.use("/bookImages", express.static(join(process.cwd(), "./data/bookImages")))
app.use("/userImages", express.static(join(process.cwd(), "./data/userImages")))
app.use(express.json())
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
    cookie: {
        maxAge: (24 * (60 * (60 * 1000))),
        secure: true
    },
    key: "TOKEN",
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