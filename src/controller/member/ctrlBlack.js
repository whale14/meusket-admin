const { UserDAO, HelpDAO, OrderDAO, BlackDAO } = require("../../DAO");

const latestBlack = async (req, res, next) => {
    try {
        return res.redirect("/member/blacks?id=&page=1");
    } catch (err) {
        return next(err);
    }
};

const blacksList = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        const { searchType, searchText, unblock, orderby } = req.query;

        if (page < 1) throw new Error("BAD_REQUEST");

        const BLACKS_PER_PAGE = 10;
        const unblockValue = Array.isArray(unblock) ? undefined : unblock;
        const blacks = await BlackDAO.getBlacksList(
            searchType,
            searchText,
            (page - 1) * BLACKS_PER_PAGE,
            BLACKS_PER_PAGE,
            unblockValue,
            orderby ? orderby : "desc"
        );

        const blacksCnt = await BlackDAO.getBlackTotalCount(
            searchType,
            searchText
        );

        const pageCnt = Math.ceil(blacksCnt / BLACKS_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("member/blacks/index.pug", {
            admin,
            blacks,
            page,
            searchText,
            searchType,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            unblock,
            orderby: orderby ? orderby : "desc",
        });
    } catch (err) {
        return next(err);
    }
};

const removeBlack = async (req, res, next) => {
    try {
        const { u_idx } = req.body;

        if ((await BlackDAO.deleteRidBlackByUidx(u_idx)) === [0, 0]) {
            throw new Error("BAD_REQUEST");
        }
        return res.redirect(`/member/black`);
    } catch (err) {
        return next;
    }
};

const searchBlack = async (req, res, next) => {
    try {
        const search = req.body.search;
        if (!search) return res.redirect(`/member/black`);
    } catch (err) {
        return next;
    }
};

module.exports = {
    latestBlack,
    blacksList,
    removeBlack,
    searchBlack,
};
