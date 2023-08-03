const multer = require("multer");
const fs = require("fs");
const randomstring = require("randomstring");
const moment = require("moment");
const path = require("path");
const util = require("util");

try {
    fs.readdirSync("uploads"); // 폴더 확인
} catch (err) {
    console.error("uploads 폴더가 없습니다. 폴더를 생성합니다.");
    fs.mkdirSync("uploads"); // 폴더 생성
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =
            moment().format("YY_MM_DD_HH:mm") + "-" + randomstring.generate(5);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // 파일이름 + 날짜 + 확장자 이름으로 저장
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5메가로 용량 제한
});

module.exports = upload;
