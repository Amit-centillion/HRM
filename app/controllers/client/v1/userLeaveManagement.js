const userLeaveManagement = require('../../../models/LeaveManagement');

const { UserSchema } = require("../../../models/user");
const moment = require('moment');
const { default: mongoose } = require('mongoose');
const applyLeave = async (req, res) => {
    const { currentUser } = req
    try {
        let payload = req.body
        let date = new Date(payload.startDate)
        let year = date.getFullYear();
        let startDate = moment(payload.startDate).startOf("day");
        let endDate = moment(payload.endDate).endOf("day");
        let diffDay = Math.round(moment(endDate).diff(startDate, "hours") / 24);
        if (diffDay === 1) {
            payload = {
                ...payload,
                addedBy: currentUser._id,
                year,
                reason: payload.reason
            }
            let savePayload = new userLeaveManagement(payload);
            await savePayload.save();
            return res.status(200).json({ status: true, message: "leave Adding success" })
        }
        else {
            let payloadUpdate = []
            for (let i = 0; i < diffDay; i++) {
                let tempPayload = {
                    ...payload,
                    startDate: moment(startDate).add(i, "days").startOf("day"),
                    endDate: moment(startDate).add(i, "days").endOf("day"),
                    year,
                    reason: payload.reason,
                    addedBy: currentUser._id,
                }
                let day = moment(tempPayload.startDate).format('dddd')
                if (day !== "Sunday" && day !== "Saturday") {
                    payloadUpdate.push(tempPayload);
                }
            }
            await userLeaveManagement.insertMany(payloadUpdate)
            return res.status(200).json({ status: true, message: "leave Adding success" })
        }
    }
    catch (err) {
        return res.status(500).send({ message: err.message, status: false });
    }
}

const updateLeave = async (req, res) => {
    try {
        let payload = req.body
        let date = new Date(payload.startDate)
        let year = date.getFullYear();
        let startDate = moment(payload.startDate).startOf("day");
        let endDate = moment(payload.endDate).endOf("day");
        let diffDay = Math.round(moment(endDate).diff(startDate, "hours") / 24);
        if (diffDay === 1) {
            payload = {
                ...payload,
                addedBy: req?.currentUser?._id,
                year,
                reason: payload.reason
            }
        }

        let response = await userLeaveManagement.findByIdAndUpdate({ _id: payload.id }, { $set: { ...payload } })
        return res.status(200).json({ status: true, message: "leave Update success", response })
    } catch (error) {
        return res.status(500).send({ message: error.message, status: false });
    }


}
const getLeave = async (req, res) => {
    try {

        let whereClause = {}
        let page = req.query.page
        let limit = req.query.limit
        if (req?.currentUser?.employeeType === 'FULLTIME') {
            whereClause = { addedBy: req?.currentUser._id }
        }
        if (req?.query?.userId) {
            whereClause = { addedBy: req?.query.userId }
        }
        if (req.query.startDate && req.query.endDate) {
            let startDate = moment(req.query.startDate).startOf("day").toISOString();
            let endDate = moment(req.query.endDate).endOf("day").toISOString();
            whereClause["startDate"] = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const data = await userLeaveManagement
            .find(whereClause)
            .skip(page > 0 ? +limit * (+page - 1) : 0)
            .limit(+limit || 20).populate({
                path: "addedBy",
                select: ["email", "firstname", "lastname", "profile", "totalAvailablePaidLeave", "profile", "designation", "totalAvailableOptionalLeave"],
            });
        const totalCount = await userLeaveManagement.find(whereClause).countDocuments();



        return res.status(200).json({ status: true, message: "leave Adding success", data, totalCount })
    }
    catch (err) {
        return res.status(500).send({ message: err.message, status: false });

    }
}
const ApproveLeave = async (req, res) => {
    try {
        const { currentUser } = req;
        const { leaveId } = req.params;
        let LeaveData = await userLeaveManagement.findById(leaveId)
        if (LeaveData) {
            await userLeaveManagement.findOneAndUpdate({ _id: leaveId }, { $set: { status: "APPROVED", approvedBy: currentUser._id } })
            let leaveCount = LeaveData.leaveType === "FIRSTHALFDAY" || LeaveData.leaveType === "SECONDHALFDAY" ? 0.5 : 1
            if (LeaveData?.type === "PAIDLEAVE") {
                await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                    $set: {
                        totalAvailablePaidLeave: currentUser.totalAvailablePaidLeave - leaveCount
                    }
                })
            } else if (LeaveData?.type === "UNPAIDLEAVE") {
                await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                    $set: {
                        totalUnpaidLeave: currentUser.totalUnpaidLeave + leaveCount
                    }
                })
            } else {
                await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                    $set: {
                        totalAvailableOptionalLeave: currentUser.totalAvailableOptionalLeave + leaveCount
                    }
                })
            }
            await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                $set: {
                    totalAvailablePaidLeave: currentUser.totalAvailablePaidLeave - leaveCount
                }
            })
            return res.status(200).json({
                status: true, message: "leave is Approved"
            });
        }
        else {
            throw new Error("Leave request failed");
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
const rejectedLeave = async (req, res) => {
    try {
        const { currentUser } = req;
        const { leaveId } = req.params;
        let LeaveData = await userLeaveManagement.findById(leaveId)
        if (LeaveData) {
            await userLeaveManagement.findOneAndUpdate({ _id: leaveId }, { $set: { status: "REJECTED", rejectedBy: currentUser._id, rejectReason: req.body.rejectReason } })

            return res.status(200).json({
                status: true, message: "leave is Rejected"
            });
        }
        else {
            throw new Error("Leave request failed");
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


const deleteLeave = async (req, res) => {
    try {
        const { _id } = req.params
        const { currentUser } = req
        let startDate = moment().startOf("day").toISOString()
        const leaveData = await userLeaveManagement.findOne({ _id });
        if (leaveData) {
            if (leaveData.status === 'APPROVED') {
                let leaveCount = leaveData.leaveType === "FIRSTHALFDAY" || leaveData.leaveType === "SECONDHALFDAY" ? 0.5 : 1
                if (LeaveData?.type === "PAIDLEAVE") {
                    await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                        $set: {
                            totalAvailablePaidLeave: currentUser.totalAvailablePaidLeave + leaveCount
                        }
                    });
                } else if (LeaveData?.type === "UNPAIDLEAVE") {
                    await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                        $set: {
                            totalUnpaidLeave: currentUser.totalUnpaidLeave - leaveCount
                        }
                    });
                } else {
                    await UserSchema.findOneAndUpdate({ _id: currentUser._id }, {
                        $set: {
                            totalAvailableOptionalLeave: currentUser.totalAvailableOptionalLeave - leaveCount
                        }
                    });
                }
                await userLeaveManagement.findOneAndRemove({ _id })
                return res.status(200).json({ success: true, message: "Successfully" })
            }

            else {
                await userLeaveManagement.findByIdAndDelete(_id)
                return res.status(200).json({ success: true, message: 'delete successfully' });
            }
        }
        else {
            throw new Error("leave is not deleted");

        }

    }
    catch (error) {
        console.log('error', error)

        return res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    applyLeave,
    getLeave,
    ApproveLeave,
    rejectedLeave,
    deleteLeave,
    updateLeave
}