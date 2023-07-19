const {
    ReportDAO,
    ErrandDAO,
    UserDAO,
    ChatDAO,
    BlackDAO,
} = require("../../DAO");
const moment = require("moment");

const latestReport = async (req, res, next) => {
    try {
        return res.redirect("/trade/reports?page=1");
    } catch (err) {
        return next(err);
    }
};

const reportsList = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const page = parseInt(req.query.page, 10);
        //날짜 확인 부분
        const startDate = req.query.startDate
            ? moment(req.query.startDate, "MM/DD/YYYY").startOf("day").toDate()
            : moment("01/01/2023", "MM/DD/YYYY").toDate();
        const endDate = req.query.endDate
            ? moment(req.query.endDate, "MM/DD/YYYY").endOf("day").toDate()
            : moment().toDate();
        //신고 상태 확인
        const { status, search } = req.query;
        const numOfStatus = 2;
        const searchStatus = [];
        for (let i = 0; i < numOfStatus; i++) {
            const isStatusExist = status && status.includes(`${i}`);
            searchStatus.push({ key: i, value: isStatusExist });
        }

        const REPORT_PER_PAGE = 10;
        const reports = await ReportDAO.getReportRequestList(
            (page - 1) * REPORT_PER_PAGE,
            REPORT_PER_PAGE,
            startDate,
            endDate,
            searchStatus,
            search
        );

        const reportsCount = await ReportDAO.getReportRequestCount(
            startDate,
            endDate,
            searchStatus,
            search
        );

        const pageCnt = Math.ceil(reportsCount / REPORT_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("trade/report/index.pug", {
            admin,
            reports,
            page,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            sDate: moment(startDate).format("MM/DD/YYYY"),
            eDate: moment(endDate).format("MM/DD/YYYY"),
            status: searchStatus,
        });
    } catch (err) {
        return next(err);
    }
};

const showReport = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const reportIdx = req.params.reportIdx;

        const report = await ReportDAO.getReportRequestByIdx(reportIdx);
        const errand = await ErrandDAO.getErrandByIdx(report.requestIdx);
        const reporter = await UserDAO.getUserByIdx(report.reporterIdx);
        const chat_room = await ChatDAO.getChatByReqIdx(errand.idx);
        const chat_content = chat_room
            ? await ChatDAO.getChatContentByIdx(chat_room.idx)
            : null;

        const requester = { idx: errand.requesterIdx, id: errand.u_id };
        requester.blackCount = await BlackDAO.getCountByIdx(requester.idx);
        const worker = { idx: errand.workerIdx, id: errand.h_id };
        worker.blackCount = await BlackDAO.getCountByIdx(worker.idx);
        const result =
            report.status == 1
                ? report.solution.split(/\n|: /).map((str) => str.trim())
                : "";

        return res.render("trade/report/detail/index.pug", {
            admin,
            report,
            errand,
            reporter,
            requester,
            worker,
            result,
            chat: { room: chat_room, content: chat_content },
        });
    } catch (err) {
        return next(err);
    }
};

const getActionReport = async (req, res, next) => {
    try {
        const { idx, subject, solution, blockReason, originalSol } = req.body;
        const period = parseInt(req.body.period);
        var blackIdx = 0;
        if (period > 0) {
            blackIdx = await UserDAO.updateUsertoBlack(
                subject,
                blockReason,
                period
            );
            if (blackIdx === -1) throw new Error("BAD_REQUEST");
        }
        var sol =
            originalSol +
            `차단번호: ${blackIdx}\n처리시간: ${moment().format(
                "YYYY-MM-DD HH:mm"
            )}\n대상자: ${subject}\n이유: ${blockReason}\n상세사유: ${solution}\n`;
        if (period > 0) sol += `기간: ${period}\n`;
        if ((await ReportDAO.updateReportRequest(idx, sol)) == 0)
            throw new Error("BAD_REQUEST");

        return res.redirect(`/trade/report/${idx}`);
    } catch (err) {
        return next(err);
    }
};

const updateReport = async (req, res, next) => {
    try {
        const { idx, subject, solution, originalSol } = req.body;
        const blockReason =
            req.body.blockReason === "other"
                ? req.body.blockReasonInput
                : req.body.blockReason;
        const period = parseInt(req.body.period);
        const blockNumberRegex = /차단번호: (\d+)/g;
        let blackNumber;
        let lastBlockNumber;
        const unblock = blockReason == "차단 사유 미발견" ? 1 : 0;

        while ((blackNumber = blockNumberRegex.exec(originalSol)) !== null) {
            lastBlockNumber = blackNumber[1];
        }
        if (
            lastBlockNumber > 0 &&
            (await BlackDAO.updateBlack(
                lastBlockNumber,
                period,
                blockReason,
                unblock
            )) == -1
        )
            throw new Error("BAD_REQUEST");
        else if (lastBlockNumber == 0) {
            lastBlockNumber = await UserDAO.updateUsertoBlack(
                subject,
                blockReason,
                period
            );
            if (lastBlockNumber === -1) throw new Error("BAD_REQUEST");
        }
        var sol =
            originalSol +
            `차단번호: ${lastBlockNumber}\n처리시간: ${moment().format(
                "YYYY-MM-DD HH:mm"
            )}\n대상자: ${subject}\n이유: ${blockReason}\n상세사유: ${solution}\n`;
        if (period > 0) sol += `기간: ${period}\n`;
        if ((await ReportDAO.updateReportRequest(idx, sol)) == 0)
            throw new Error("BAD_REQUEST");
        return res.redirect(`/trade/report/${idx}`);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    latestReport,
    reportsList,
    showReport,
    getActionReport,
    updateReport,
};
