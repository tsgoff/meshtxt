// node server.js --port 8080 --meshtastic-api-url https://10.1.0.249

import axios from "axios";
import express from "express";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

// fixme: setup http agent to allow invalid cert for axios instead?
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const optionsList = [
    {
        name: "help",
        alias: "h",
        type: Boolean,
        description: "Display this usage guide."
    },
    {
        name: "port",
        type: Number,
        description: "Port to serve Web UI and API from. e.g: 8080",
    },
    {
        name: "meshtastic-api-url",
        type: String,
        description: "The URL to a Meshtastic devices HTTP API. e.g: https://10.1.0.123",
    },
];

// parse command line args
const options = commandLineArgs(optionsList);

function main() {

    // show help
    if(options.help){
        const usage = commandLineUsage([
            {
                header: "MeshTXT Server",
                content: "A server that hosts the MeshTXT Web UI and runs a proxy to a Meshtastic devices HTTP API.",
            },
            {
                header: "Options",
                optionList: optionsList,
            },
        ]);
        console.log(usage);
        return;
    }

    // get options and fallback to default values
    const port = options["port"] ?? 8080;
    const meshtasticApiUrl = options["meshtastic-api-url"] ?? "https://localhost";

    // if provided, ensure meshtastic api url is http or https
    if(meshtasticApiUrl !== "" && !meshtasticApiUrl.startsWith("http://") && !meshtasticApiUrl.startsWith("https://")){
        console.log("ERROR: --meshtastic-api-url must start with http:// or https://");
        return;
    }

    // create express app
    const app = express();

    // allow retrieving raw request body as buffer
    app.use((req, res, next) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            req.rawBody = Buffer.concat(chunks);
            next();
        });
    });

    // serve vite app from /dist
    app.use("/", express.static("./dist"));

    // setup proxy endpoints to meshtasticd if api url was provided
    if(meshtasticApiUrl !== ""){

        // proxy fromradio to meshtasticd to allow connecting to localhost to bypass cors
        app.get("/api/v1/fromradio", async (req, res) => {
            try {

                // proxy fromradio request to meshtasticd endpoint
                const response = await axios({
                    method: "GET",
                    responseType: "arraybuffer",
                    url: `${meshtasticApiUrl}/api/v1/fromradio`,
                    params: req.query,
                });

                // send response back
                res.status(response.status).set({
                    "Content-Type": "application/x-protobuf",
                    "Content-Length": response.data.length,
                }).send(response.data);

            } catch(e) {
                console.error(`Proxy error: ${e.message}`);
                res.status(502).send("Proxy Error");
            }
        });

        app.put("/api/v1/toradio", async (req, res) => {
            try {

                // proxy toradio request to meshtasticd endpoint
                const response = await axios({
                    method: "PUT",
                    responseType: "arraybuffer",
                    url: `${meshtasticApiUrl}/api/v1/toradio`,
                    headers: {
                        "Content-Type": "application/x-protobuf",
                        "Content-Length": req.rawBody.length,
                    },
                    data: req.rawBody,
                    params: req.query,
                });

                // send response back
                res.status(response.status).set({
                    "Content-Type": "application/x-protobuf",
                    "Content-Length": response.data.length,
                }).send(response.data);

            } catch(e) {
                console.error(`Proxy error: ${e.message}`);
                res.status(502).send("Proxy Error");
            }
        });

    }

    // run server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });

}

main();
