
require("dotenv").config();
const AppServer = require("./AppServer");

const PORT = process.env.PORT; 
const appInstance = new AppServer(PORT);

appInstance.start();