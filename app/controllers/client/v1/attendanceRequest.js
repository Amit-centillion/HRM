const UserTimeEntry = require("../../../models/user-time-entry");
const AttendanceRequest = require("../../../models/attendance-request");
const { CONSTANTS } = require("../../../constants");

class AttendanceRequestController {
    create = async (req, res) => {
        try {
            const currentUserId = req.currentUser._id;
            const payload = {
                userId: currentUserId,
                requested_date: req.body.requested_date,
                time_in: req.body.time_in,
                time_out: req.body.time_out,
                reason: req.body.reason,
                status: CONSTANTS.ATTENDANCE_REQUEST_STATUS.PENDING
            };

            const requestRecord = await AttendanceRequest.create(payload);
            return res.status(200).json({ success: true, data: requestRecord });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    updateRequestStatus = async (req, res) => {
        try {
            const requestRecord = await AttendanceRequest.findOneAndUpdate({ _id: req.body.id }, {
                status: req.body.status,
            });
            return res.status(200).json({ success: true, data: requestRecord });

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

            if (requestRecord.time_in) {
                await UserTimeEntry.create({
                    type: CONSTANTS.CLOCK_TYPE.CLOCK_IN,
                    timeStamp: `${requestRecord.requested_date}T${requestRecord.time_in}`,
                    userId: requestRecord.userId,
                    isDeleted: false
                });
            }

            if (requestRecord.time_out) {
                await UserTimeEntry.create({
                    type: CONSTANTS.CLOCK_TYPE.CLOCK_OUT,
                    timeStamp: `${requestRecord.requested_date}T${requestRecord.time_out}`,
                    userId: requestRecord.userId,
                    isDeleted: false
                });
            }

            return res.status(200).json({ success: true, data: requestRecord });

        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AttendanceRequestController();
