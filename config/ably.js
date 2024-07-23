import { Ably } from "ably";
import dotenv from "dotenv";
dotenv.config();

const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });

// export default ably;

const users = {};
const map = new Map();

ably.connection.on('connected', () => {
    console.log('Ably connected');
});

const channel = ably.channels.get('webRTC-signaling');

channel.subscribe('message', (msg) => {
    const message = msg.data;

    const isjsonstring = checkisJson(message);

    if (isjsonstring) {
        const data = JSON.parse(message);

        switch (data.type) {
            case "login":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_login", success: false });
                    console.log("login failed");
                } else {
                    users[data.name] = data.clientId;
                    map.set(data.name, 'online');
                    sendTo(data.name, { type: "server_login", success: true });
                    console.log("Login success");
                    updateAllUsers();
                }
                break;
            
            case "offer":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_offer", offer: data.offer, name: data.clientId });
                } else {
                    sendTo(data.clientId, { type: "server_nouser", success: false });
                }
                break;
            
            case "answer":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_answer", answer: data.answer });
                }
                break;
            
            case "candidate":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_candidate", candidate: data.candidate });
                    console.log("candidate sending --");
                }
                break;
            
            case "leave":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_userwanttoleave" });
                    sendTo(data.clientId, { type: "server_userwanttoleave" });
                    map.set(data.name, 'online');
                    map.set(data.clientId, 'online');
                    users[data.name].otherName = null;
                    users[data.clientId].otherName = null;
                    updateAllUsers();
                    console.log("end room");
                }
                break;
            
            case "busy":
                if (users[data.name]) {
                    sendTo(data.name, { type: "server_busyuser" });
                }
                break;
            
            case "want_to_call":
                if (users[data.name]) {
                    if ((users[data.name].otherName != null) && map.get(data.name) == "busy") {
                        sendTo(data.clientId, { type: "server_alreadyinroom", success: true, name: data.name });
                    } else {
                        sendTo(data.clientId, { type: "server_alreadyinroom", success: false, name: data.name });
                    }
                } else {
                    sendTo(data.clientId, { type: "server_nouser", success: false });
                }
                break;

            case "ready":
                if (users[data.name]) {
                    users[data.clientId].otherName = data.name;
                    users[data.name].otherName = data.clientId;
                    map.set(data.name, 'busy');
                    map.set(data.clientId, 'busy');
                    sendTo(data.name, { type: "server_userready", success: true, peername: data.clientId });
                    sendTo(data.clientId, { type: "server_userready", success: true, peername: data.name });
                    updateAllUsers();
                }
                break;

            case "quit":
                if (data.name) {
                    delete users[data.clientId];
                    map.delete(data.name);
                    updateAllUsers();
                }
                break;

            default:
                sendTo(data.clientId, { type: "server_error", message: "Unrecognized command: " + data.type });
                break;
        }
    } else {
        console.log("not a json");
        if (message == "clientping") {
            console.log("clientping");
            sendTo(data.clientId, { type: "server_pong", name: "pong" });
        }
    }
});

function sendTo(clientId, message) {
    channel.publish('message', JSON.stringify({ clientId, ...message }));
}

function updateAllUsers() {
    const obj = Object.fromEntries(map);
    for (let user in users) {
        sendUpdatedUserlist(users[user], [...map]);
    }
}

function sendUpdatedUserlist(clientId, message) {
    sendTo(clientId, { type: "server_userlist", name: message });
}

function checkisJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
