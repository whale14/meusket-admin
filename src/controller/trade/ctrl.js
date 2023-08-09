const { ErrandDAO, CategoryDAO } = require("../../DAO");

const changeCategoryForm = async (req, res, next) => {
    try {
        const rootIndex = req.query.rootIndex;
        const categories = rootIndex
            ? await CategoryDAO.getWorkCategoryByRootIdx(rootIndex)
            : undefined;
        const rootCategories = await CategoryDAO.getWorkRootCategory();
        const rootCategory = rootIndex
            ? await CategoryDAO.getWorkCategoryByIdx(rootIndex)
            : undefined;
        return res
            .status(200)
            .json({ categories, rootCategory, rootCategories });
    } catch (err) {
        return next(err);
    }
};
const changeCategory = async (req, res, next) => {
    try {
        const {
            rootCategoryIdx,
            rootCategoryName,
            subcategoryIdx,
            subcategoryName,
        } = req.body;
        const subIdx = Array.isArray(subcategoryIdx)
            ? subcategoryIdx
            : [subcategoryIdx];
        const subNames = Array.isArray(subcategoryName)
            ? subcategoryName
            : [subcategoryName];
        if (rootCategoryName) {
            subIdx.push(rootCategoryIdx);
            subNames.push(rootCategoryName);
        }
        if (subIdx.length > 0 && subIdx.length == subNames.length) {
            await CategoryDAO.updateWorkCategoryNameByIdxArray(
                subIdx,
                subNames
            );
            return res.sendStatus(200);
        } else throw new Error("BAD_REQUEST");
    } catch (err) {
        return next(err);
    }
};

module.exports = { changeCategory, changeCategoryForm };
