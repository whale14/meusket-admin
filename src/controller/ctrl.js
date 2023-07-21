const { AdminDAO, UserDAO, OrderDAO } = require("../DAO");
const { verifyCode } = require("../lib/encryption");

const indexPage = async (req, res, next) => {
    try {
        const { admin } = req.session;
        if (!admin) return res.redirect("/auth/sign_in");
        return res.render("index.pug", { admin });
    } catch (err) {
        return next(err);
    }
};

const editProfileForm = async (req, res, next) => {
    try {
        const { admin } = req.session;
        //비밀번호 변경, 관리자 정보 등 출력해야함
        return res.render("admin/edit.pug", { admin });
    } catch (err) {
        return next(err);
    }
};

const editProfile = async (req, res, next) => {
    try {
        const { admin } = req.session;
        const { admin_id, name, new_password, cur_password } = req.body;
        const newAdmin = { admin_id, name };

        const password = await AdminDAO.getAdminPasswordById(admin.admin_id);

        if (!cur_password || password != cur_password) {
            res.render("admin/edit.pug", {
                admin: newAdmin,
                password_not_match: true,
            });
            return;
        }
        if (!new_password) {
            res.render("admin/edit.pug", {
                admin: newAdmin,
                password_not_fill: true,
            });
            return;
        }
        const updateAdmin = await AdminDAO.updateAdmin(
            admin.admin_id,
            newAdmin.admin_id,
            newAdmin.name,
            new_password
        );
        req.session.admin = {
            admin_id: updateAdmin.admin_id,
            name: updateAdmin.name,
        };
        return res.redirect("/");
    } catch (err) {
        return next(err);
    }
};

const manageAdminForm = async (req, res, next) => {
    try {
        const { admin } = req.session;

        const page = parseInt(req.query.page, 10);
        const authorities = req.query.authority;
        const numOfauthority = 8; //0-7
        const searchauthority = [];
        for (let i = 0; i < numOfauthority; i++) {
            const isStatusExist = authorities && authorities.includes(`${i}`);
            searchauthority.push({ key: `${i}`, value: isStatusExist });
        }
        const ADMIN_PER_PAGE = 15;

        const admins = await AdminDAO.getAdminList(
            (page - 1) * ADMIN_PER_PAGE,
            ADMIN_PER_PAGE,
            searchauthority
        );

        const adminsCount = await AdminDAO.getAdminCount(
            (page - 1) * ADMIN_PER_PAGE,
            ADMIN_PER_PAGE,
            searchauthority
        );

        const pageCnt = Math.ceil(adminsCount / ADMIN_PER_PAGE);
        const minPage = page - 2 > 1 ? page - 2 : 1;
        const maxPage = page + 2 < pageCnt ? page + 2 : pageCnt;

        return res.render("admin/index.pug", {
            admin,
            admins,
            page,
            minPage,
            maxPage,
            hasPrev: page - 2 > 1,
            hasNext: page + 2 < pageCnt,
            authority: searchauthority,
        });
    } catch (err) {
        return next(err);
    }
};

const latestAdmin = async (req, res, next) => {
    try {
        const { admin } = req.session;
        if (admin.authority > 1 || admin.authority == 0)
            throw new Error("UNAUTHORIZED");
        return res.redirect("/manages?page=1");
    } catch (err) {
        return next(err);
    }
};

const manageAdmin = async (req, res, next) => {
    try {
        const { authority, idx } = req.body;
        if ((await AdminDAO.updateAdminAuthority(idx, authority)) == 0)
            throw new Error("BAD_REQUEST");
        return res.redirect("/manages?page=1");
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    indexPage,
    editProfileForm,
    editProfile,
    manageAdmin,
    manageAdminForm,
    latestAdmin,
};
