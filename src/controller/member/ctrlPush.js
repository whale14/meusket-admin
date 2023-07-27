const { UserDAO, PushDAO } = require("../../DAO");
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

const lastestPushes = async (req, res, next) => {
    try {
        return res.redirect("/member/pushes?page=1");
    } catch (err) {
        return next(err);
    }
};

const sendPushNotificationForm = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        if (page < 1) throw new Error("BAD_REQUEST");

        const PUSHES_PER_PAGE = 15;
        const pushes = await PushDAO.getPushes(
            (page - 1) * PUSHES_PER_PAGE,
            PUSHES_PER_PAGE
        );
        const pushCnt = await PushDAO.getPushesCount();

        const pageCnt = Math.ceil(pushCnt / PUSHES_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;
        return res.render("member/push/index.pug", {
            admin,
            page,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            pushes,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    lastestPushes,
    sendPushNotification,
    sendPushNotificationForm,
};
