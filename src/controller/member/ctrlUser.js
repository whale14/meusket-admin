const { UserDAO, ErrandDAO, HelpDAO, AdminDAO } = require("../../DAO");
const moment = require("moment");
const { verifyCode } = require("../../lib/encryption");

const usersList = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        const { type, search, orderby } = req.query;
        const startDate = req.query.startDate
            ? moment(req.query.startDate, "MM/DD/YYYY").toDate()
            : moment("01/01/2023", "MM/DD/YYYY").toDate();
        const endDate = req.query.endDate
            ? moment(req.query.endDate, "MM/DD/YYYY").toDate()
            : moment().toDate();
        const user = req.query.user == "true";
        const helper = req.query.helper == "true";
        const black = req.query.black == "true";
        if (page < 1) throw new Error("BAD_REQUEST");

        const USERS_PER_PAGE = 15;

        if (type !== undefined && !["name", "id", "idx"].includes(type))
            throw new Error("BAD_REQUEST");
        const users = await UserDAO.getUsersBySearch(
            type,
            search,
            (page - 1) * USERS_PER_PAGE,
            USERS_PER_PAGE,
            startDate,
            endDate,
            user,
            helper,
            black,
            orderby
        );
        const usersCnt = await UserDAO.getUserSearchCount(
            search,
            type,
            startDate,
            endDate,
            user,
            helper,
            black
        );

        const pageCnt = Math.ceil(usersCnt / USERS_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("member/users/index.pug", {
            admin,
            users,
            page,
            search,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            type,
            sDate: moment(startDate).format("MM/DD/YYYY"),
            eDate: moment(endDate).format("MM/DD/YYYY"),
            user,
            helper,
            black,
            orderby: orderby ? orderby : "idx",
        });
    } catch (err) {
        return next(err);
    }
};

const latestUser = async (req, res, next) => {
    try {
        return res.redirect("/member/users?page=1");
    } catch (err) {
        return next(err);
    }
};

const showUser = async (req, res, next) => {
    try {
        const usersIdx = req.params.userIdx;
        const { admin } = req.session;

        const user = await UserDAO.getUserByIdx(usersIdx);
        if (!user) throw new Error("NOT_EXIST");
        const ERRAND_PER_PAGE = 5;

        const errands = await ErrandDAO.getErrandsByUserIdx(usersIdx);
        const wallet = await UserDAO.getWalletbyIdx(usersIdx);
        let helper = null;
        if (user.isWorkerRegist === 1) {
            const helperIdx = user.idx;
            helper = await HelpDAO.getHelperByIdx(helperIdx);

            if (helper.bio && helper.bio.length > 10) {
                helper.bio = helper.bio.substring(0, 10) + "...";
            }

            const errands = await ErrandDAO.getErrandsByHelperIdx(helperIdx);
            helper.errands = errands;
        }
        return res.render("member/users/details/index.pug", {
            admin,
            user,
            errands,
            helper,
            wallet,
        });
    } catch (err) {
        return next(err);
    }
};

const blockUser = async (req, res, next) => {
    try {
        const { authority } = req.session.admin;
        if (authority >= 3) throw new Error("UNAUTHORIZED");
        const { idx, period } = req.body;
        const blockReason =
            req.body.blockReason === "기타 사유"
                ? req.body.blockReasonInput
                : req.body.blockReason;
        if (
            period != "" &&
            parseInt(period) > 0 &&
            (await UserDAO.updateUsertoBlack(idx, blockReason, period)) === -1
        )
            throw new Error("BAD_REQUEST");

        return res.redirect(`/member/black`);
    } catch (err) {
        return next(err);
    }
};

const removeUser = async (req, res, next) => {
    try {
        const { authority } = req.session.admin;
        if (authority >= 3) throw new Error("UNAUTHORIZED");
        const { idx, id } = req.body;
        if ((await UserDAO.deleteUser(idx, id)) == false)
            throw new Error("BAD_REQUEST");
        return res.redirect("/member/user");
    } catch (err) {
        return next(err);
    }
};

const revokeHelper = async (req, res, next) => {
    try {
        const { authority } = req.session;
        if (authority > 3) throw new Error("UNAUTHORIZED");
        const { idx } = req.body;
        await HelpDAO.revokeHelperPosition(idx);
        return res.redirect(`/member/user/${idx}`);
    } catch (err) {
        return next(err);
    }
};

const editUserRequest = async (req, res, next) => {
    try {
        const { admin } = req.session;
        if (admin.authority > 3)
            return res.status(403).json({ error: "권한이 없습니다!" });
        const { password } = req.body;
        const admin_info = await AdminDAO.getAdminById(admin.admin_id);
        const isValid = await verifyCode(password, admin_info.password);
        if (!isValid) {
            return res.status(400).json({ error: "잘못된 비밀번호입니다!" });
        }

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};

const editUser = async (req, res, next) => {
    try {
        const { idx, id, name, bio, introduce, bank, accountNumber } = req.body;
        const update = await UserDAO.updateUserInfo(
            idx,
            id,
            name,
            bio,
            introduce,
            bank,
            accountNumber
        );
        if (update) {
            if (update["updateHelper"])
                return res.status(200).json({
                    updateUser: update["updatedUser"],
                    updateHelper: update["updateHelper"],
                });
            return res.status(200).json({ updateUser: update["updatedUser"] });
        } else return res.status(400).json({ error: "업데이트 실패!" });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    usersList,
    latestUser,
    showUser,
    blockUser,
    removeUser,
    revokeHelper,
    editUserRequest,
    editUser,
};
