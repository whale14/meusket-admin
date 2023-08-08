const { ErrandDAO } = require("../../DAO");

const changeCategoryForm = async (req, res, next) => {
    try {
        const rootIndex = req.query.rootIndex;
        const categories = rootIndex
            ? await ErrandDAO.getWorkCategoryByRootIdx(rootIndex)
            : undefined;
        const rootCategories = await ErrandDAO.getWorkRootCategory();
        const rootCategory = rootIndex
            ? await ErrandDAO.getWorkCategoryByIdx(rootIndex)
            : undefined;
        console.log(rootCategory);
        return res
            .status(200)
            .json({ categories, rootCategory, rootCategories });
    } catch (err) {
        return next(err);
    }
};
const changeCategory = async (req, res, next) => {
    try {
    } catch (err) {
        return next(err);
    }
};

module.exports = { changeCategory, changeCategoryForm };
