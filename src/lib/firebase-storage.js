const admin = require("firebase-admin");
const serviceAccount = require("../firebase-admin.json");
const path = require("path");
const logger = require("./logger");

const firebaseUpload = async (filePath) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "gs://instaclone-c4bac.appspot.com",
        });
    }
    try {
        const bucket = admin.storage().bucket();
        bucket.upload(filePath, {
            destination: "uploads/" + path.basename(filePath),
            validateChecksums: true,
        });
        console.log("Successfully uploaded", filePath);
        logger.info("Successfully uploaded", filePath);
    } catch (err) {
        console.error("Error uploading messages:", err);
        logger.error("Error uploading messages:", {
            message: err,
        });
        throw new Error("SENDING_FAILED");
    }
};

const firebaseGetUrl = async (filePath) => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: "gs://instaclone-c4bac.appspot.com",
        });
    }
    try {
        const options = {
            version: "v4",
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        };
        const [url] = await admin
            .storage()
            .bucket()
            .file(filePath)
            .getSignedUrl(options);
        console.log(`Url of image is: ${url}`);
        logger.info(`Url of image is: ${url}`);
        return url;
    } catch (err) {
        console.error("Error retrieving url: ", err);
        logger.error("Error retrieving url: ", { message: err });
        throw new Error("SENDING_FAILED");
    }
};

module.exports = { firebaseUpload, firebaseGetUrl };
