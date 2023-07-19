const { BlackDAO } = require("../DAO");

const deleteExpiredBlacklists = async () => {
    const unexpiredBlacks = await BlackDAO.getUnexpiredBlacks();
    const currentDate = Date.now();

    for (const blacklist of unexpiredBlacks) {
        const expirationDate = new Date(blacklist.createAt);
        expirationDate.setDate(
            expirationDate.getDate() + parseInt(blacklist.period)
        );
        if (currentDate > expirationDate) {
            await BlackDAO.deleteRidBlackByUid(blacklist.u_id);
            console.log(`블랙리스트 삭제: U_ID ${blacklist.u_id}`);
        }
    }
};

module.exports = {
    deleteExpiredBlacklists,
};
