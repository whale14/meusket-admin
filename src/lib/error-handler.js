const getAlertScript = (msg) =>
    `<script>alert("${msg}");history.back();</script>`;

const errorHandler = (err, req, res, next) => {
    switch (err.message) {
        case "BAD_REQUEST":
            return res.send(getAlertScript("잘못된 접근입니다!"));
        case "UNAUTHORIZED":
            return res.send(getAlertScript("권한이 없습니다!"));
        case "NOT_EXIST":
            return res.render("error.pug", {
                errorCode: 404,
                errorMsg: "Not Found",
            });
        default:
            if (process.env.MODE !== "prod")
                console.error("\x1b[31m%s\x1b[0m", err);
            return res.render("error.pug", {
                errorCode: 500,
                errorMsg: "Internal Server Error",
            });
    }
};

module.exports = { errorHandler };
