const admin = require("firebase-admin");
const logger = require("./logger");
const serviceAccount = require("../firebase-admin.json");

const sendFcmPushNotification = async (title, content, userFcmTokens) => {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    const notification = {
        title: title,
        body: content,
    };
    const length = userFcmTokens.length;
    for (let i = 0; i < length; i += 500) {
        var tokensChunk;
        if (i + 500 > length) tokensChunk = userFcmTokens.slice(i);
        else tokensChunk = userFcmTokens.slice(i, i + 500);
        console.log(tokensChunk);
        const payload = {
            notification: notification,
            tokens: tokensChunk,
        };
        try {
            const response = await admin
                .messaging()
                .sendEachForMulticast(payload);
            console.log("Successfully sent messages:", response);
            logger.info("Successfully sent messages:", { message: response });
            return 0;
        } catch (err) {
            console.log("Error sending messages:", err);
            logger.error("Error sending messages:", { message: err });
            return -1;
        }
    }
};

module.exports = { sendFcmPushNotification };
