// Express app
import express from "express";
import handleRoute from "./routes";
import bodyParser from "body-parser";

// Handlebars
import path from "path";
import SetupHandlebars from "./services/handlebars.service";

// Http server
import { createServer } from "http";

// Websocket Server
import runWebsocketService from "./services/websocket.service";
import { WebSocketServer } from "ws";

// Services
import * as ffmpegService from "./services/ffmpeg.service";

// Morgan
import morgan from "morgan";

// Mongoose
import connectDb from "./config/database/mongoose.config";
import { EnvironmentModel } from "./config/database/schema/environment.schema";

// Error handler
import handleError from "./utils/handleError.util";

// Environments
import { envConfig } from "./config";
import { randomIntFromInterval } from "./utils/number.util";

// Secure
import cors from "cors"

// Constants
const { HOST, PORT } = envConfig;

// Server
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({
    server: httpServer,
    host: HOST,
    maxPayload: 256 * 1024,
});


//
// CORS
//
app.use(cors({
    origin: "*"
}))

//
// MORGAN
//
app.use(morgan("tiny"));

//
// BODY PARSER
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use(bodyParser.json());

//
// STATIC FILES
//
app.use("/public", express.static(path.join(__dirname, "../public")));

//
// HANDLEBARS
//
const setupExHbs = new SetupHandlebars(app);
setupExHbs.setup();

//
// HANDLE ROUTE
//
handleRoute(app);

//
// RUN SERVICES
//
// Ffmpeg
ffmpegService.run();
// Websocket
runWebsocketService(wss, HOST, PORT);

//
// ERROR HANDLER
//
app.use(handleError);

//
// START SERVER
//
httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

//
// MONGOOSE
//
connectDb()
    .then(() => {
        console.log("Connected to database!");
    })
    .catch(() => {
        console.log("Connect fail to database!");
    });

EnvironmentModel.create({
    temp: randomIntFromInterval(0, 100),
    humidity: randomIntFromInterval(0, 100),
});

export { wss, httpServer, HOST, PORT };
