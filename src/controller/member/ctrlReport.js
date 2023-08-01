const { ReportDAO, UserDAO, BlackDAO } = require("../../DAO");
const moment = require("moment");

const latestReport = async (req, res, next) => {
    try {
        return res.redirect("/member/reports?page=1");
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
        const reports = await ReportDAO.getReportList(
            "user",
            (page - 1) * REPORT_PER_PAGE,
            REPORT_PER_PAGE,
            startDate,
            endDate,
            searchStatus,
            search
        );

        const reportsCount = await ReportDAO.getReportCount(
            "user",
            startDate,
            endDate,
            searchStatus,
            search
        );

        const pageCnt = Math.ceil(reportsCount / REPORT_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("member/report/index.pug", {
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

        const report = await ReportDAO.getReportByIdx("user", reportIdx);
        const reporter = await UserDAO.getUserByIdx(report.reporterIdx);
        reporter.blackCount = await BlackDAO.getCountByIdx(reporter.idx);

        const reported = await UserDAO.getUserByIdx(report.toIdx);
        reported.blackCount = await BlackDAO.getCountByIdx(reported.idx);
        const result =
            report.status == 1
                ? report.solution.split(/\n|: /).map((str) => str.trim())
                : "";

        return res.render("member/report/detail/index.pug", {
            admin,
            report,
            reporter,
            reported,
            result,
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
        if ((await ReportDAO.updateRequest("user", idx, sol)) == 0)
            throw new Error("BAD_REQUEST");

        return res.redirect(`/member/report/${idx}`);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    latestReport,
    reportsList,
    showReport,
    getActionReport,
};
