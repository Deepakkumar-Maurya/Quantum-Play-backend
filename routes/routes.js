import express from "express";
import auth from "./auth.route.js";

const Router = express.Router();

Router.use("/auth", auth);

Router.get("/", (req, res) => {
    res.json({
        title: "Quantum-Play API",
        features: "WebRTC signalling, peer-to-peer gameplay, and more!",
        documentation: "https://github.com/P2PGaming/Quantum-Play-backend",
        ApiEndpoints: {
            "POST /": "Signalling endpoint for WebRTC",
        },
    });
});

export default Router;
