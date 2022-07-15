const UserTimeEntry = require("../../../models/user-time-entry");
const AttendanceRequest = require("../../../models/attendance-request");
const { CONSTANTS } = require("../../../constants");
const moment = require("moment-timezone");
class AttendanceRequestController {
    create = async (req, res) => {
        try {
            const currentUserId = req.currentUser._id;
            const payload = {
                userId: currentUserId,
                requested_date: req.body.requested_date,
                time_in: req.body.time_in,
                createdAt: req.body.requested_date,
                time_out: req.body.time_out,
                reason: req.body.reason,
                status: CONSTANTS.ATTENDANCE_REQUEST_STATUS.PENDING
            };

            const requestRecord = await AttendanceRequest.create(payload);
            return res.status(200).json({ success: true, data: requestRecord, msg: CONSTANTS.ATTENDANCE_REQUEST_STATUS.SUCCESS_MSG });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getAttendanceRequest = async (req, res) => {
        try {
            let criteria = {};
            if (req.query.userId) {
                criteria.userId = req.query.userId
            }
            if (req.query.startDate && req.query.endDate) {
                var startDateRecord = req.query.startDate
                var endDateRecord = req.query.endDate
                criteria["requested_date"] = {
                    $gte: startDateRecord,
                    $lte: endDateRecord
                };
            }
            console.log('criteria', criteria)
            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                sort: { createdAt: -1 },
                populate: "userId",
            };

            let attendanceRequest =
                req.query.page || req.query.limit
                    ? await AttendanceRequest.paginate(criteria, options)
                    : await AttendanceRequest.find(criteria)
                        .sort({
                            createdAt: -1,
                        })
                        .populate({
                            path: "userId",
                            select: ["email", "firstname", "lastname", "profile", "profile", "designation", "email"],
                        });
            return res.status(200).json({ success: true, data: attendanceRequest });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    getAttendancePendingRequest = async (req, res) => {
        try {
            let attendanceRequest = await AttendanceRequest.find({ status: "pending" })
                .sort({
                    createdAt: -1,
                })
                .populate({
                    path: "userId",
                    select: ["email", "firstname", "lastname", "profile", "profile", "designation", "email"],
                });
            return res.status(200).json({ success: true, data: attendanceRequest });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    updateRequestStatus = async (req, res) => {
        try {
            const requestRecord = await AttendanceRequest.findOneAndUpdate({ _id: req.body._id }, {
                status: req.body.status,
                isDeleted: req.body.status === "approved" ? false : true
            });
            console.log('requestRecord', requestRecord)
            return res.status(200).json({ success: true, data: requestRecord, message: req.body.status === "approved" ? "Attendance" + " " + CONSTANTS.ATTENDANCE_REQUEST_STATUS.APPROVED : req.body.status === "cancelled" ? "Attendance" + " " + CONSTANTS.ATTENDANCE_REQUEST_STATUS.CANCELLED : req.body.status === "rejected" ? "Attendance" + " " + CONSTANTS.ATTENDANCE_REQUEST_STATUS.REJECTED : "" });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    approve = async (req, res) => {
        try {
            const currentUserId = req.currentUser._id;
            const requestRecord = await AttendanceRequest.findOneAndUpdate(
                { _id: req.body.id },
                {
                    status: CONSTANTS.ATTENDANCE_REQUEST_STATUS.APPROVED,
                    approvedBy: currentUserId
                });
            let updateRecord;
            if (requestRecord?.time_in) {
                await UserTimeEntry.create({
                    type: CONSTANTS.CLOCK_TYPE.CLOCK_IN,
                    timeStamp: moment(requestRecord.requested_date + ' ' + requestRecord.time_in),
                    userId: requestRecord.userId,
                    createdAt: moment(requestRecord.requested_date + ' ' + requestRecord.time_in),
                    updatedAt: moment(requestRecord.requested_date + ' ' + requestRecord.time_in),
                    isDeleted: false,
                    requestDate: moment(requestRecord.requested_date)
                });
            }

            if (requestRecord?.time_out) {
                await UserTimeEntry.create({
                    type: CONSTANTS.CLOCK_TYPE.CLOCK_OUT,
                    timeStamp: moment(requestRecord.requested_date + ' ' + requestRecord.time_out),
                    userId: requestRecord.userId,
                    createdAt: moment(requestRecord.requested_date + ' ' + requestRecord.time_out),
                    updatedAt: moment(requestRecord.requested_date + ' ' + requestRecord.time_out),
                    isDeleted: false,
                    requestDate: moment(requestRecord.requested_date)
                });
            }

            return res.status(200).json({ success: true, data: requestRecord });

        } catch (error) {
            console.log('error', error)
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AttendanceRequestController();
