// chartConfig.js

// 기본 차트 정보
const chartInfo = {
    title: "", // 차트 제목 (기본값: 빈 문자열)
    xAxis: {
        title: "", // X축 제목
    },
    yAxis: {
        title: "", // Y축 제목
    },
    series: [
        {
            name: "Trade Index", // 데이터 시리즈 이름
            data: [], // 차트 데이터
        },
    ],
};

function getChartInfo() {
    return chartInfo;
}

function setChartTitle(title) {
    chartInfo.title = title;
}

function setChartXYAxis(x_title, y_title) {
    chartInfo.xAxis = x_title;
    chartInfo.yAxis = y_title;
}

const setChartData = (label, datas, type) => {
    const backgroundColors = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
    ];

    const datasets = datas.map((data, index) => {
        return {
            label: data.label,
            data: data.data,
            backgroundColor: backgroundColors[index % backgroundColors.length],
            borderColor: backgroundColors[index % backgroundColors.length],
            borderWidth: 1,
        };
    });
    if (type != "line") {
        datasets[0]["backgroundColor"] = backgroundColors;
        datasets[0]["borderColor"] = undefined;
    }
    const chartData = {
        labels: label,
        datasets: datasets,
    };

    return chartData;
};

const setChartOption = (stepSize) => {
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                    stepSize: stepSize,
                },
            },
        },
    };
    return chartOptions;
};

module.exports = {
    getChartInfo,
    setChartTitle,
    setChartXYAxis,
    setChartData,
    setChartOption,
};
