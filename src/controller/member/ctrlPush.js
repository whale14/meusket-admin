const { UserDAO, PushDAO, AdminDAO } = require("../../DAO");
const { sendFcmPushNotification } = require("../../lib/fcm-push");
const {
    firebaseUpload,
    firebaseGetUrl,
} = require("../../lib/firebase-storage");

const sendPushNotification = async (req, res, next) => {
    try {
        if (req.file && req.file.size > 300 * 1024)
            throw new Error("FILE SIZE ERROR");
        //받을 내용
        const { admin } = req.session;
        const { pushTitle, pushContent, type, subject } = req.body;
        const pushImage = req.file ? req.file : undefined;
        pushImage.url = undefined;
        if (pushImage) {
            await firebaseUpload(pushImage.path);
            pushImage.url = await firebaseGetUrl(pushImage.path);
        }
        //받을 대상
        //userType -> isWorkerRegist에 등록되었냐 안되었냐로 구분.
        const { userType, charityRange } = req.body;
        const types = Array.isArray(type) ? type : [type];
        const userTypes = Array.isArray(userType) ? userType : [userType];
        if (subject != "all" && userTypes.length < 1)
            throw new Error("BAD_REQUEST");

        const tokens = await UserDAO.getUsersFcmTokensByType(
            subject,
            userTypes,
            charityRange
        );
        if (tokens.length < 1) {
            throw new Error("NO_TARGET");
        }
        for (const item of types) {
            if (item === "kakao") {
                console.log("kakao");
            } else if (item === "push") {
                if (
                    (await sendFcmPushNotification(
                        pushTitle,
                        pushContent,
                        pushImage.url,
                        tokens
                    )) != 0
                )
                    throw new Error("SENDING_FAILED");
            }
        }
        const adminIdx = await AdminDAO.getAdminIdxById(admin.admin_id);
        const record = await PushDAO.insertPush(
            pushTitle,
            pushContent,
            pushImage.path,
            adminIdx
        );
        if (!record) throw new Error("BAD_REQUEST");
        const PUSHES_PER_PAGE = 15;
        const pushes = await PushDAO.getPushes(0, PUSHES_PER_PAGE);
        return res.status(200).json({ pushes });
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

const showPush = async (req, res, next) => {
    try {
        const pushIdx = req.params.pushIdx;
        const { admin } = req.session;
        const push = await PushDAO.getPushByIdx(pushIdx);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    lastestPushes,
    sendPushNotification,
    sendPushNotificationForm,
    showPush,
};
