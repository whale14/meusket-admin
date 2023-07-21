const moment = require("moment");
const { ErrandDAO, ChatDAO, CancelDAO } = require("../../DAO");

const errandsList = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        //날짜 검색 부분
        const startDate = req.query.startDate
            ? moment(req.query.startDate, "MM/DD/YYYY").startOf("day").toDate()
            : moment("01/01/2023", "MM/DD/YYYY").toDate();
        const endDate = req.query.endDate
            ? moment(req.query.endDate, "MM/DD/YYYY").endOf("day").toDate()
            : moment().toDate();
        //상태 체크 부분
        const status = req.query.status;
        const numOfStatus = 8; //0-7
        const searchStatus = [];
        for (let i = 1; i < numOfStatus; i++) {
            const isStatusExist = status && status.includes(`${i}`);
            if (i == 1)
                searchStatus.push({ key: `${i - 1}`, value: isStatusExist });
            searchStatus.push({ key: `${i}`, value: isStatusExist });
        }
        //카테고리 셀렉트 부분
        const rootCategoryIdx = isNaN(parseInt(req.query.rootCategory))
            ? -1
            : parseInt(req.query.rootCategory);
        const categoryIdx = isNaN(parseInt(req.query.subCategory))
            ? -1
            : parseInt(req.query.subCategory);
        //부름이/드림이 검색 부분
        const { searchType, search } = req.query;

        //카테고리들 가져와서 pug로 넘기는 부분
        const rootCategories = await ErrandDAO.getWorkRootCategory();
        const categories = [];
        for (i in rootCategories) {
            const categoriesByRoot = await ErrandDAO.getWorkCategoryByRootIdx(
                i
            );
            categories.push(categoriesByRoot);
        }

        const subCategory = await ErrandDAO.getWorkCategoryByRootIdx(
            rootCategoryIdx
        );

        if (page < 1) throw new Error("BAD_REQUEST");
        const ERRAND_PER_PAGE = 15;

        const errands = await ErrandDAO.getErrandsList(
            (page - 1) * ERRAND_PER_PAGE,
            ERRAND_PER_PAGE,
            startDate,
            endDate,
            searchStatus,
            rootCategoryIdx,
            categoryIdx,
            searchType,
            search
        );
        const errandsCount = await ErrandDAO.getErrandsCount(
            startDate,
            endDate,
            searchStatus,
            rootCategoryIdx,
            categoryIdx,
            searchType,
            search
        );

        const pageCnt = Math.ceil(errandsCount / ERRAND_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("trade/errands/index.pug", {
            admin,
            errands,
            page,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            status: searchStatus,
            rootCategories,
            categories,
            rootCategoryIdx,
            categoryIdx,
            subCategory,
            sDate: moment(startDate).format("MM/DD/YYYY"),
            eDate: moment(endDate).format("MM/DD/YYYY"),
        });
    } catch (err) {
        return next(err);
    }
};

const latestErrand = async (req, res, next) => {
    try {
        return res.redirect("/trade/errands?page=1");
    } catch (err) {
        return next(err);
    }
};

const showErrand = async (req, res, next) => {
    try {
        const errandIdx = req.params.errandIdx;
        const { admin } = req.session;

        const errand = await ErrandDAO.getErrandByIdx(errandIdx);

        if (!errand) throw new Error("NOT_EXIST");

        errand.category = await ErrandDAO.getWorkCategoryByIdx(
            errand.workCategoryIdx
        );
        const recruitments = await ErrandDAO.getRecruitmentByIdx(errandIdx);

        const reviews = await ErrandDAO.getReviewByIdx(errandIdx);
        if (errand.recruitmentStatus != 0 && !recruitments)
            throw new Error("NOT_EXIST");

        const cancel = await CancelDAO.getCancelByIdx(errandIdx);
        if (errand.status == 5 && !cancel) throw new Error("NOT_EXIST");

        const chat_room = await ChatDAO.getChatByReqIdx(errandIdx);
        const chat_content = chat_room
            ? await ChatDAO.getChatContentByIdx(chat_room.idx)
            : null;
        return res.render("trade/errands/detail/index.pug", {
            admin,
            errand,
            recruitments,
            reviews,
            cancel,
            chat: { room: chat_room, content: chat_content },
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    latestErrand,
    errandsList,
    showErrand,
};
