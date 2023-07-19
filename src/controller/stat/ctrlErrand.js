const { ErrandDAO, UserDAO } = require("../../DAO");
const { setChartOption, setChartData } = require("../../lib/chart-config");

const defaultStat = async (req, res, next) => {
    try {
        return res.redirect("/stat/errand/index");
    } catch (err) {
        return next(err);
    }
};

const errandChart = async (req, res, next) => {
    try {
        const { admin } = req.session;

        const mostDoneErrand = await ErrandDAO.getTopDoneErrands();
        const mostDoneRootErrnad = await ErrandDAO.getTopDoneRootErrands();
        const mostExpensiveCategory = await ErrandDAO.getMostExtremeCategory(
            "desc"
        );
        const mostCheapCategory = await ErrandDAO.getMostExtremeCategory("asc");
        const errandCountByStatus = await ErrandDAO.getTotalErrandCount();
        const rewardSumByStatus =
            await ErrandDAO.getTotalErrandRewardByStatus();

        const totalCount =
            errandCountByStatus.find((item) => item.status === 10)
                ?.requestCount || 0;
        const successCount = errandCountByStatus
            .filter((item) => [2, 3, 4].includes(item.status))
            .reduce((total, item) => total + item.requestCount, 0);
        const errandSuccessRate = ((successCount * 10) / totalCount) * 10;

        //차트 생성
        const chartOptions = setChartOption(1);
        //요일별 차트
        const cntForWeekday = await ErrandDAO.getCntErrandForWeek();
        var labels = [];
        var tdata = [];
        cntForWeekday.map((row) => {
            tdata.push(row.count);
            labels.push(row.day_of_week);
        });
        const cntForWeekData = setChartData(
            labels,
            [{ label: "요일", data: tdata }],
            "bar"
        );
        //시간대별 차트
        const cntForHour = await ErrandDAO.getCntErrandForHour();
        labels = [];
        tdata = [];
        cntForHour.map((row) => {
            tdata.push(row.count);
            labels.push(row.hour_range);
        });
        const cntForHourData = setChartData(
            labels,
            [{ label: "시간대", data: tdata }],
            "bar"
        );
        //가격대별 라트
        const cntForMoney = await ErrandDAO.getCntForRewardRange();
        labels = [];
        tdata = [];
        cntForMoney.map((row) => {
            tdata.push(row.count);
            labels.push(row.reward_range);
        });
        const cntForMoneyData = setChartData(
            labels,
            [{ label: "가격대", data: tdata }],
            "bar"
        );

        return res.render("stats/trade/index.pug", {
            admin,
            errandLeftStat: [
                totalCount,
                rewardSumByStatus.totalRewardSum,
                errandSuccessRate,
                rewardSumByStatus.rewardSum,
            ],
            errandRightStat: [
                mostDoneErrand,
                mostDoneRootErrnad,
                mostExpensiveCategory,
                mostCheapCategory,
            ],
            chartOptions,
            cntForWeekData: { data: cntForWeekData, type: "bar" },
            cntForHourData: { data: cntForHourData, type: "bar" },
            cntForMoneyData: { data: cntForMoneyData, type: "bar" },
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    defaultStat,
    errandChart,
};
