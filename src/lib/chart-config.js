// chartConfig.js

class ChartObject {
    constructor() {
        this.type = "";
        this.data = {
            labels: [],
            datasets: [],
        };
        this.options = {
            maxBarThickness: 5,
            elements: {
                point: {
                    radius: 3, // 데이터 포인트의 점 크기
                },
            },
            showLine: true,
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        title: {
                            font: "",
                        },
                        fontFamily: "",
                    },
                    grid: {},
                },
                y: {
                    ticks: {
                        title: {
                            font: "",
                        },
                        fontFamily: "",
                    },
                    grid: {},
                },
            },
            indexAxis: "",
            legend: {
                labels: {
                    defaultFontFamily: "Lato",
                },
                display: true,
            },
            tooltip: {
                titleFontSize: 12,
            },
            plugins: {
                legend: false,
            },
        };
    }
    setType = (type) => {
        this.type = type;
        return this;
    };
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
    setOptionsScalesAxisFont = (axis, font) => {
        if (axis.toLowerCase() === "x") {
            this.options.scales.x.ticks.title.font = font;
        } else if (axis.toLowerCase() === "y") {
            this.options.scales.y.ticks.title.font = font;
        }
    };
    setChartlabels = (labels) => {
        this.data.labels = labels;
        return this;
    };
    setChartDatasets = (datasets) => {
        this.data.datasets = datasets;
        return this;
    };
    setOptionsPulginLegend = (bool) => {
        this.options.plugins.legend = bool == "true";
        return this;
    };
    setOptionsMaxBarWidth = (width) => {
        this.options.maxBarThickness = width;
        return this;
    };
    setOptionScalesAxisGrid = (axis, grid) => {
        if (axis.toLowerCase() === "x") {
            this.options.scales.x.grid = grid;
        } else {
            this.options.scales.y.grid = grid;
        }
        return this;
    };
    setOptionScalesAxisAxisFontFamily = (axis, font) => {
        if (axis.toLowerCase() === "x") {
            this.options.scales.x.ticks.fontFamily = font;
        } else {
            this.options.scales.y.ticks.fontFamily = font;
        }
        return this;
    };
    setOptionsTooltipTitleFontSize = (size) => {
        this.options.tooltip.titleFontSize = size;
        return this;
    };

    getConfig() {
        return {
            type: this.type,
            data: this.data,
            options: this.options,
        };
    }
}

class ChartDatasets {
    constructor() {
        this.label = "";
        this.data = [];
        this.borderColor = "";
        this.backgroundColor = "rgba(193, 193, 193, 0.5)";
        this.borderWidth = 0;
        this.borderRadius = "";
        this.hoverBorderColor = "";
        this.hoverBackgroundColor = "";
    }

    setLabel = (label) => {
        this.label = label;
        return this;
    };

    setData = (data) => {
        this.data = data;
        return this;
    };

    setBorderColor = (borderColor) => {
        this.borderColor = borderColor;
        return this;
    };

    setBackgroundColor = (backgroundColor) => {
        this.backgroundColor = backgroundColor;
        return this;
    };

    setBorderWidth = (borderWidth) => {
        this.borderWidth = borderWidth;
        return this;
    };

    setBorderRadius = (borderRadius) => {
        this.borderRadius = borderRadius;
        return this;
    };

    setHoverBorderColor = (hoverColor) => {
        this.hoverBorderColor = hoverColor;
        return this;
    };

    setHoverBackgroundColor = (hoverColor) => {
        this.hoverBackgroundColor = hoverColor;
        return this;
    };

    getConfig() {
        return {
            label: this.label,
            data: this.data,
            borderColor: this.borderColor,
            backgroundColor: this.backgroundColor,
            borderWidth: this.borderWidth,
            borderRadius: this.borderRadius,
            hoverBorderColor: this.hoverBorderColor,
            hoverBackgroundColor: this.hoverBackgroundColor,
        };
    }
}

module.exports = { ChartObject, ChartDatasets };
