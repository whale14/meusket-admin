const { UserDAO } = require("../../DAO");
const { sendFcmPushNotification } = require("../../lib/fcmPush");

const sendPushNotification = async (req, res, next) => {
    try {
        //받을 내용
        const { title, content } = req.body;
        //받을 대상
        const { userType } = req.body;
        const tokens = [
            "fITiKrC0Rs2oh2LUkY7zFC:APA91bHr5PuQer9oX-19oUwMu8N3uz2UUkzi-x8gd4c3uJiG9FMsvhmkZXxALnfQs3t-_IWpW-V6j8dNuq7iS5Lffp_XGNB9INn2wyQVm33yWRv3xPanfXvjO-YMkb5YXEmEgHLfBRO-",
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
