const { UserDAO, HelpDAO, BlackDAO, ErrandDAO } = require("../../DAO");
const moment = require("moment");
const { ChartObject, ChartDatasets } = require("../../lib/chart-config");

const defaultStat = async (req, res, next) => {
    try {
        return res.redirect("/stat/user/index");
    } catch (err) {
        return next(err);
    }
};

const userIndex = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const startMonth = moment().startOf("month").toDate();
        const startDay = moment().startOf("day").toDate();
        const endDay = moment().endOf("day").toDate();

        const userCnt = parseInt(await UserDAO.getUserTotalCount());
        const newUserCnt = await UserDAO.getUserCountBetweenTime(
            startMonth,
            endDay
        );
        // const outUserCnt = await UserDAO.getUserUnregistered();
        // const dailyUserCnt = parseInt(await UserDAO.getLastVisitorByPeriod(1));
        // const weeklyUserCnt = parseInt(await UserDAO.getLastVisitorByPeriod(7));
        // const monthlyUserCnt = parseInt(
        //     await UserDAO.getLastVisitorByPeriod(30)
        // );
        const userStat = [
            userCnt,
            newUserCnt,
            //     outUserCnt,
            //     parseInt((dailyUserCnt / userCnt) * 100),
            //     parseInt((weeklyUserCnt / userCnt) * 100),
            //     parseInt((monthlyUserCnt / userCnt) * 100),
        ];

        const helpCnt = parseInt(await HelpDAO.getHelperTotalCount());
        const cntAndSum = await ErrandDAO.getErrandNumAndSum();
        const helperStat = [
            helpCnt,
            parseInt(cntAndSum.avg_count * 10) / 10,
            parseInt(cntAndSum.avg_total),
        ];

        const blackCnt = parseInt(await BlackDAO.getBlackTotalCount());
        const duplicateBlackCnt = await BlackDAO.getDuplicatedBlackCount(2);
        const currBlackCnt = await BlackDAO.getCurrBlackCnt();

        const blackStat = [blackCnt, currBlackCnt, duplicateBlackCnt];

        return res.render("stats/user/index.pug", {
            admin,
            type: "index",
            userStat,
            helperStat,
            blackStat,
        });
    } catch (err) {
        return next(err);
    }
};

const userChart = async (req, res, next) => {
    try {
        const { admin } = req.session;

        const top10ErrandsUsers = await ErrandDAO.getManyErrandsUserTop5(
            "requesterIdx"
        );
        const top10MoneyUsers = await ErrandDAO.getMuchMoneyUserTop5(
            "requesterIdx"
        );
        const topScoreUsers = await ErrandDAO.getErrandReviewAvgScore(
            "requesterIdx"
        );

        for (i in topScoreUsers) {
            topScoreUsers[i].review = [];
            const reviews = await ErrandDAO.getUserReveiwByUserIdx(
                topScoreUsers[i]["idx"],
                "requesterIdx"
            );
            for (j in reviews) {
                topScoreUsers[i].review.push(reviews[j]);
            }
        }
        var labels = [];
        var formatData = [];
        //누적 부름이 가입자
        const cumUserCounts = await UserDAO.getCumulativeUserCount();
        cumUserCounts.map((count) => {
            labels.push(count.date);
            formatData.push(count.cum_users);
        });
        const cumUserChart = new ChartObject();
        const cumUserChartset = new ChartDatasets();
        cumUserChartset.setData(formatData).setLabel("누적 부름이");
        cumUserChart
            .setChartDatasets(cumUserChartset.getConfig())
            .setChartlabels(labels)
            .setType("line")
            .setOptionScalesStepSize("y", 1);

        //2주간 부름이 가입자
        const today = moment(moment().toDate()).format("YYYY-MM-DD");
        const twoWeeksAgo = moment(
            moment().subtract(14, "days").toDate()
        ).format("YYYY-MM-DD");

        const userCounts = await UserDAO.getUsersCntByDate(twoWeeksAgo, today);

        // // 날짜를 레이블로 변환
        const startDate = moment(twoWeeksAgo);
        const endDate = moment(today);

        labels = [];
        formatData = [];
        for (
            let currentDate = startDate;
            currentDate.isSameOrBefore(endDate);
            currentDate.add(1, "day")
        ) {
            const formattedDate = currentDate.format("YYYY-MM-DD");
            labels.push(formattedDate);
            const userCount = userCounts.find(
                (data) => data.date === formattedDate
            );
            formatData.push(userCount ? userCount.count : 0);
        }
        const newUserForTwoWeeksChart = new ChartObject();
        newUserForTwoWeeksChart
            .setChartData(labels, [{ label: "누적 부름이", data: formatData }])
            .setType("bar")
            .setOptionScalesStepSize("y", 1);

        return res.render("stats/user/requester/userChart.pug", {
            admin,
            type: "user",
            top10ErrandsUsers,
            top10MoneyUsers,
            topScoreUsers,
            registerCumultive: cumUserChart,
            registerTwoWeeks: newUserForTwoWeeksChart,
        });
    } catch (err) {
        return next(err);
    }
};

const helperChart = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const top10ErrandsHelpers = await ErrandDAO.getManyErrandsUserTop5(
            "workerIdx"
        );
        const top10MoneyHelpers = await ErrandDAO.getMuchMoneyUserTop5(
            "workerIdx"
        );
        const topScoreHelpers = await ErrandDAO.getErrandReviewAvgScore(
            "workerIdx"
        );

        for (i in topScoreHelpers) {
            topScoreHelpers[i].review = [];
            const reviews = await ErrandDAO.getUserReveiwByUserIdx(
                topScoreHelpers[i]["idx"],
                "workerIdx"
            );
            for (j in reviews) {
                topScoreHelpers[i].review.push(reviews[j]);
            }
        }

        return res.render("stats/user/worker/helperChart.pug", {
            admin,
            type: "helper",
            top10ErrandsHelpers,
            top10MoneyHelpers,
            topScoreHelpers,
        });
    } catch (err) {
        return next(err);
    }
};

module.exports = { defaultStat, userIndex, userChart, helperChart };
