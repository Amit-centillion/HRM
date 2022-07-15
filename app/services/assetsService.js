const aseetsmanagements = require("../models");
const deletebyid = (id) => {
    const res = aseetsmanagements.updateOne(
        { _id: id },
        { isEnabled: false, deletedAt: new Date(), deletedBy: id },
    );
    return res;
};


module.exports = { deletebyid };
