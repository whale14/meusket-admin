const { AdminDAO } = require("../../DAO");
const { generateCode, verifyCode } = require("../../lib/encryption");

const signIn = async (req, res, next) => {
    try {
        const { admin_id, password } = req.body;
        if (!admin_id || !password) {
            return res
                .status(400)
                .json({ error: "아이디, 비밀번호를 입력해주세요!" });
        }

        const admin = await AdminDAO.getAdminById(admin_id);
        if (!admin) {
            return res
                .status(400)
                .json({ error: "아이디가 존재하지 않습니다!" });
        }
        const isValid = await verifyCode(password, admin.password);
        if (!isValid) {
            return res
                .status(400)
                .json({ error: "비밀번호가 일치하지 않습니다!" });
        }

        const authority = await AdminDAO.getAdminAuthorityByIdx(admin.idx);
        if (!authority || authority < 1) {
            //1이 최상위 관리자, 0: 등록되지 않은 관리자 2: 중간 관리자, 3: 하위 관리자
            return res
                .status(403)
                .json({ error: "등록되지 않은 관리자입니다!" });
        }
        if (authority == 1) admin.authorName = "최상위 관리자";
        else if (authority == 2) admin.authorName = "중간 관리자";
        else if (authority == 3) admin.authorName = "하위 관리자";
        req.session.admin = {
            admin_id: admin.id,
            name: admin.name,
            authority: authority,
            authorityName: admin.authorName,
            phone: admin.phone,
        };
        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};

const signInForm = (req, res, next) => {
    try {
        const { admin } = req.session;
        if (admin) return res.redirect("/");
        else
            return res.render("auth/sign-in.pug", {
                admin,
            });
    } catch (err) {
        return next(err);
    }
};

const signOut = async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) throw err;
            else res.redirect("/");
        });
    } catch (err) {
        return next(err);
    }
};

const signUpForm = async (req, res, next) => {
    try {
        const { admin } = req.session;
        if (admin) return res.redirect("/");
        else return res.render("auth/sign-up.pug", { admin });
    } catch (err) {
        return next(err);
    }
};

const signUp = async (req, res, next) => {
    try {
        const { admin_id, password, name, phone } = req.body;
        if (!admin_id || admin_id.length < 5 || admin_id.length > 20) {
            return res.render("auth/sign-up.pug", {
                id_error: "아이디가 올바르지 않습니다.",
                admin: req.body,
            });
        }
        const admin = await AdminDAO.getAdminById(admin_id);
        if (admin) {
            return res.render("auth/sign-up.pug", {
                id_error: "중복된 아이디가 존재합니다.",
                admin: req.body,
            });
        }
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()\-_=+{};:,<.>]/.test(password);

        const conditions = [
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar,
        ];

        const fulfilledConditions = conditions.filter((condition) => condition);

        if (!password || password.length < 8 || fulfilledConditions < 3) {
            return res.render("auth/sign-up.pug", {
                pw_error: "비밀번호가 올바르지 않습니다.",
                admin: req.body,
            });
        }

        const hashedPassword = await generateCode(password);
        if (
            (await AdminDAO.createAdminAccount(
                admin_id,
                name,
                hashedPassword
            )) == 1
        ) {
            const message = "신청이 완료되었습니다. 관리자 승인이 필요합니다!";
            const redirectUrl = "/auth/sign_in";
            return res.render("auth/sign-up.pug", { message, redirectUrl });
        } else throw new Error("BAD_REQUEST");
    } catch (err) {
        return next(err);
    }
};

const adminRequest = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const { password, authority } = req.body;
        const admin_info = await AdminDAO.getAdminById(admin.admin_id);
        const isValid = await verifyCode(password, admin_info.password);
        if (!isValid)
            return res.status(400).json({ error: "잘못된 비밀번호입니다!" });
        var authority_num = 3;
        if (authority == "edit") authority_num = 2;
        else if (authority == "remove") authority_num = 1;
        if (admin.authority > authority_num)
            return res.status(403).json({ error: "권한이 없습니다!" });

        return res.sendStatus(200);
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    signIn,
    signInForm,
    signOut,
    signUpForm,
    signUp,
    adminRequest,
};
