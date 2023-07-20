const { HelpDAO, UserDAO } = require("../../DAO");
const { generateCode } = require("../../lib/encryption");

const applyList = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        const work_category = await HelpDAO.getWorkCategory();

        if (page < 1) throw new Error("BAD_REQUEST");

        const APPLY_PER_PAGE = 10;

        const worker_approvals = await HelpDAO.getHelperApplyList(
            (page - 1) * APPLY_PER_PAGE,
            APPLY_PER_PAGE
        );
        for (i in worker_approvals) {
            const categories = worker_approvals[i].workCategory.split(", ");
            if (categories.length > 2) {
                worker_approvals[i].category = categories
                    .slice(0, 2)
                    .join(", ");
            } else {
                worker_approvals[i].category = worker_approvals[i].workCategory;
            }
        }
        const applycount = await HelpDAO.getHelperApplyTotalCount();

        const pageCnt = Math.ceil(applycount / APPLY_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("member/apply/index.pug", {
            admin,
            worker_approvals,
            page,
            hasPrev: page - 2 > 1,
            minPage,
            maxPage,
            hasNext: page + 2 < pageCnt,
            work_category,
        });
    } catch (err) {
        return next(err);
    }
};

const latestApply = async (req, res, next) => {
    try {
        return res.redirect("/member/applies?name=&page=1");
    } catch (err) {
        return next(err);
    }
};

const showApply = async (req, res, next) => {
    try {
        const applyIdx = req.params.applyIdx;
        const { admin } = req.session;

        const apply = await HelpDAO.getHelperApplyByIdx(applyIdx);
        if (!apply) throw new Error("NOT_EXIST");

        const applyUser = await UserDAO.getUserByIdx(apply.userIdx);
        if (!applyUser) throw new Error("NOT_EXIST");

        return res.render("member/apply/apply.pug", {
            admin,
            apply,
            applyUser,
        });
    } catch (err) {
        return next(err);
    }
};

const approveHelper = async (req, res, next) => {
    try {
        const applyIdx = req.params.applyIdx;
        const apply = await HelpDAO.getHelperApplyByIdx(applyIdx);

        const recognitionText = apply.recognitionText;

        let regex = /\d{6}-\d{7}/;
        const recognitionNumber = recognitionText.match(regex)[0];
        if (!recognitionNumber || recognitionNumber.length < 13)
            throw new Error("BAD_REQUEST");

        regex = /(\p{L}{2,})\s\d{6}-\d{7}/u;
        const recognitionName = recognitionText.match(regex)[1];
        if (!recognitionName || recognitionName != apply.accountName)
            throw new Error("BAD_REQUEST");

        const hashedRecogNum = await generateCode(recognitionNumber);
        if (
            (await HelpDAO.updateWorkerToHelper(
                apply.userIdx,
                hashedRecogNum
            )) == [0, 0, 0, 0]
        ) {
            throw new Error("BAD_REQUEST");
        }

        return res.redirect("/member/user");
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    applyList,
    latestApply,
    showApply,
    approveHelper,
};
