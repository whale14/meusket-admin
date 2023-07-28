const admin = require("firebase-admin");
const logger = require("./logger");
const serviceAccount = require("../firebase-admin.json");

class fcmMessage {
    constructor() {
        this.notification = { title: "", body: "" };
        this.tokens = [];
    }
    setNotification = (title, body) => {
        this.notification.title = title;
        this.notification.body = body;
        return this;
    };
    setTokens = (tokens) => {
        this.tokens = tokens;
        return tokens;
    };
    getconfig() {
        return {
            notification: this.notification,
            toekns: this.tokens,
        };
    }
}

const sendMessage = async (fcm) => {
    try {
        const response = await admin.messaging().sendEachForMulticast(fcm);
        console.log("Successfully sent messages:", response);
        logger.info("Successfully sent messages:", {
            message: response,
        });
        return response;
    } catch (err) {
        console.log("Error sending messages:", err);
        logger.error("Error sending messages:", {
            message: err,
        });
        throw new Error("SENDING_FAILED");
    }
};

const sendFcmPushNotification = async (title, content, userFcmTokens) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }
    const fcm = new fcmMessage();
    fcm.setNotification(title, content);
    const length = userFcmTokens.length;
    try {
        for (let i = 0; i < length; i += 500) {
            var tokensChunk;
            if (i + 500 > length) tokensChunk = userFcmTokens.slice(i);
            else tokensChunk = userFcmTokens.slice(i, i + 500);
            fcm.setTokens(tokensChunk);
            await sendMessage(fcm);
        }
        return 0;
    } catch (err) {
        return err;
    }
};

module.exports = { sendFcmPushNotification };
