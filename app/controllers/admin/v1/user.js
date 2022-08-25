const { UserSchema } = require("../../../models/user");

class UserController {
    /**
     * Assign team leader in user document
     * @param {*} req 
     * @param {*} res 
     * @returns current login user document
     */
    async assignTeamLeader(req, res) {
        try {
            let user = await UserSchema.updateOne({
                _id: req.currentUser._id
            }, {
                teamLeader: req.body.userId
            });
            return res.status(200).json({ success: true, data: user, message: "Successfully team leader assigned" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
