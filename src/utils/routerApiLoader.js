let { readdirSync } = require("fs")
let { resolve } = require("path")
let routesFolderPath = resolve(process.cwd(), process.env.routesFolderPath || "./src/routers")
/**
 * 
 * @param {import("express").Application} app 
 */
module.exports = (app) => {
    let routes = readdirSync(routesFolderPath).filter(file => file.endsWith(".js"))
    routes.forEach(file => {
        let routePath = resolve(routesFolderPath, file)
        let data = require(routePath)
        if (data.route && data.exec) {
            app.use(`/api/v${data.version}/${data.route}`, data.exec)
        }
        console.log("Loaded Router: " + file);
    })
}