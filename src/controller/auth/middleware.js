const authRequired = async (req, res, next) => {
    try {
        if (req.session.admin) return next();
        else return res.redirect("/auth/sign_in");
    } catch (err) {
        throw next(err);
    }
};

module.exports = { authRequired };
