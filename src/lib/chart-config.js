// chartConfig.js

class ChartObject {
    constructor() {
        this.type = "";
        this.data = {
            labels: [],
            datasets: [],
        };
        this.options = {
            elements: {
                point: {
                    radius: 3, // 데이터 포인트의 점 크기
                },
            },
            showLine: true,
            responsive: true,
            scales: {
                x: { ticks: {} },
                y: { ticks: {} },
            },
            indexAxis: "",
        };
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setChartOption = (option) => {
        this.options = option;
        return this;
    };
    setOptionIndexAxis = (type) => {
        this.options.indexAxis = type;
        return this;
    };
    setOptionElementPoint = (radius) => {
        this.options.elements.point.radius = radius;
        return this;
    };
    setOptionScalesPrecision = (precision) => {
        this.options.scales.precision = precision;
        return this;
    };
    setOptionScalesAxisBeginsAtZero = (axis, bool) => {
        if (axis.toLowerCase() === "x") {
            this.options.scales.x.ticks.beginAtZero = bool;
        } else if (axis.toLowerCase() === "y") {
            this.options.scales.y.ticks.beginAtZero = bool;
        }
        return this;
    };
    setOptionScalesStepSize = (axis, size) => {
        if (axis.toLowerCase() === "x") {
            this.options.scales.x.ticks.stepSize = size;
        } else if (axis.toLowerCase() === "y") {
            this.options.scales.y.ticks.stepSize = size;
        }
        return this;
    };

    setChartData(labels, datas) {
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
                backgroundColor:
                    backgroundColors[index % backgroundColors.length],
                borderColor: backgroundColors[index % backgroundColors.length],
                borderWidth: 1,
            };
        });

        if (this.type !== "line") {
            datasets.forEach((dataset, index) => {
                dataset.backgroundColor =
                    backgroundColors[index % backgroundColors.length];
                dataset.borderColor = undefined;
            });
        }

        this.data = {
            labels: labels,
            datasets: datasets,
        };

        return this;
    }

    getConfig() {
        return {
            type: this.type,
            data: this.data,
            options: this.options,
        };
    }
}

module.exports = ChartObject;
