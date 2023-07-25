const { UserDAO } = require("../../DAO");
const { sendFcmPushNotification } = require("../../lib/fcmPush");

const sendPushNotification = async (req, res, next) => {
    try {
        //받을 내용
        const { title, content } = req.body;
        //받을 대상
        const { userType } = req.body;
        const tokens = [
            "dQVzfo53StGl9fK7rDvKX9:APA91bHkzkcvm9PSZWGpnsyyI6LI0A26iWlA8p_coQ-2TrBQHgMlvzQk_5jDXe1sZaqBfUmjIZmEkLcG0LZ3UOxk3_tXl_pVu2MNHUlehQatP4Erow8u20pxZP1J0MMp6fn36g6TMDFS",
        ];
        // await UserDAO.getUsersFcmTokensByType();
        // console.log(tokens);
        if (tokens.length < 1) {
            throw new Error("NO_TARGET");
        }
        if (sendFcmPushNotification(title, content, tokens) == -1) {
            throw new Error("SENDING_FAILED");
        }
        return res.redirect("/");
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};

const sendPushNotificationForm = async (req, res, next) => {
    try {
        const { admin } = req.session;
        return res.render("", { admin });
    } catch (err) {
        return next(err);
    }
};

module.exports = { sendPushNotification, sendPushNotificationForm };
