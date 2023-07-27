const { ErrandDAO, UserDAO } = require("../../DAO");
const { ChartObject, ChartDatasets } = require("../../lib/chart-config");

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
        const errandSuccessRate =
            parseInt((successCount * 1000) / totalCount) / 10;

        //요일별 차트
        const cntForWeekday = await ErrandDAO.getCntErrandForWeek();
        var labels = [];
        var tdata = [];
        cntForWeekday.map((row) => {
            tdata.push(row.count);
            labels.push(row.day_of_week);
        });
        const cntForWeekChart = new ChartObject();
        const cntForWeekChartDataset = new ChartDatasets();
        cntForWeekChartDataset
            .setData(tdata)
            .setLabel("요일")
            .setBackgroundColor("rgba(193, 193, 193, 0.8)")
            .setHoverBackgroundColor("rgba(246, 132, 50, 1)");
        cntForWeekChart
            .setChartDatasets([cntForWeekChartDataset.getConfig()])
            .setChartlabels(labels)
            .setType("bar")
            .setOptionsMaxBarWidth(15)
            .setOptionScalesStepSize("y", 2);
        //시간대별 차트
        const cntForHour = await ErrandDAO.getCntErrandForHour();
        labels = [];
        tdata = [];
        cntForHour.map((row) => {
            tdata.push(row.count);
            labels.push(row.hour_range);
        });
        const cntForHourChart = new ChartObject();
        const cntForHourChartDataset = new ChartDatasets();
        cntForHourChartDataset
            .setData(tdata)
            .setLabel("시간대")
            .setBackgroundColor("rgba(193, 193, 193, 0.8)")
            .setHoverBackgroundColor("rgba(246, 132, 50, 1)");
        cntForHourChart
            .setChartDatasets([cntForHourChartDataset.getConfig()])
            .setChartlabels(labels)
            .setType("bar")
            .setOptionsMaxBarWidth(15)
            .setOptionScalesStepSize("y", 2);
        //가격대별 라트
        const cntForMoney = await ErrandDAO.getCntForRewardRange();
        labels = [];
        tdata = [];
        cntForMoney.map((row) => {
            tdata.push(row.count);
            labels.push(row.reward_range);
        });
        const cntForMoneyChart = new ChartObject();
        const cntForMoneyChartDataset = new ChartDatasets();
        cntForMoneyChartDataset
            .setData(tdata)
            .setLabel("가격대")
            .setBackgroundColor("rgba(193, 193, 193, 0.8)")
            .setHoverBackgroundColor("rgba(246, 132, 50, 1)");
        cntForMoneyChart
            .setChartDatasets([cntForMoneyChartDataset.getConfig()])
            .setChartlabels(labels)
            .setType("doughnut")
            .setOptionsMaxBarWidth(15)
            .setOptionScalesStepSize("y", 2);

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
            cntForWeekData: cntForWeekChart,
            cntForHourData: cntForHourChart,
            cntForMoneyData: cntForMoneyChart,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    defaultStat,
    errandChart,
};
