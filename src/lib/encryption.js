const util = require("util");
const crypto = require("crypto");

const pbkdf2 = util.promisify(crypto.pbkdf2);
const randomBytes = util.promisify(crypto.randomBytes);

const generateCode = async (code) => {
    const ALGO = "sha512";
    const KEY_LEN = 64;
    const salt = await randomBytes(32);
    const iter = Math.floor(Math.random() * 20000) + 200000;
    const digest = await pbkdf2(code, salt, iter, KEY_LEN, ALGO);
    return `${ALGO}:${salt.toString(
        "base64"
    )}:${iter}:${KEY_LEN}:${digest.toString("base64")}`;
};

const verifyCode = async (code, hashedCode) => {
    const [algo, encodedSalt, iterStr, keyLenStr, encodedDigest] =
        hashedCode.split(":");
    const salt = Buffer.from(encodedSalt, "base64");
    const iter = parseInt(iterStr, 10);
    const keyLen = parseInt(keyLenStr, 10);
    const storedDigest = Buffer.from(encodedDigest, "base64");
    const digest = await pbkdf2(code, salt, iter, keyLen, algo);
    return Buffer.compare(digest, storedDigest) === 0;
};

const encryptRecogNum = async (recogNum, key) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encryptedInfo = cipher.update(recogNum, "utf8", "hex");
    encryptedInfo += cipher.final("hex");
    return `${iv.toString("hex")}:${encryptedInfo}`;
};

const decryptRecogNum = async (encryptedRecogNum, key) => {
    const [encodedIV, encodedRecogNum] = encryptedRecogNum.split(":");
    const iv = Buffer.from(encodedIV, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decryptedRecogNum = decipher.update(encodedRecogNum, "hex", "utf8");
    decryptedRecogNum += decipher.final("utf8");
    return decryptedRecogNum;
};

const isValidPassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()\-_=+{};:,<.>]/.test(password);

    const conditions = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];

    const fulfilledConditions = conditions.filter((condition) => condition);
    return fulfilledConditions;
};

module.exports = {
    generateCode,
    verifyCode,
    encryptRecogNum,
    decryptRecogNum,
    isValidPassword,
};
