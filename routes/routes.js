import express from "express";

const Router = express.Router();



Router.get("/", (req, res) => {
    res.json({
        title: "Quantum-Play API",
        features: "WebRTC signalling, peer-to-peer gameplay, and more!",
        documentation: "https://github.com/P2PGaming/Quantum-Play-backend",
        ApiEndpoints: {
            "POST /": "Signalling endpoint for WebRTC",
        }
    })
})

module.exports = Router