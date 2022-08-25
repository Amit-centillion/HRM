const { UserSchema } = require('../../../models/user');
const leavesRequest = require('../../../models/LeaveRequest');
const moment = require("moment");
const { CONSTANTS } = require('../../../constants');
class LeavesRequestController {
    async createRequest(req, res) {
        try {
            const userData = await UserSchema.findOne(
                {
                    _id: req.currentUser._id,
                    isDeleted: false
                }
            );
            const userDataById = await UserSchema.findOne({ employeeType: "ADMIN" });
            console.log('req.body.startDate', req.body.startDate)
            const startDates = moment(req.body.startDate).startOf('day');
            console.log('startDates', startDates)
            const endDates = moment(req.body.endDate).endOf('day');
            let datesAll = []
            let m;
            for (m = moment(startDates); m.isBefore(moment(endDates)); m.add(1, 'days')) {
                datesAll.push(m.format('YYYY-MM-DD'));
            }
            let payload = [];
            if (datesAll.length > 0) {
                const dataPayload = {
                    dates: req.body.startDate,
                    reason: req.body.reason,
                    requestedTo: userDataById?._id ? userDataById?._id : "61d2971975cf2724596a05be",
                    userId: req?.currentUser?._id,
                    leaveGrantType: req.body.leaveGrantType,
                    leaveType: req.body.leaveType,
                    status: CONSTANTS.LEAVE_REQUEST_STATUS.PENDING
                }

                for (let i = 0; i < datesAll.length; i++) {
                    let dataValues = [dataPayload]
                    dataPayload['dates'] = datesAll[i];
                    console.log('dataPayload', dataPayload)
                    payload.push(dataPayload);
                    // console.log('dataValues', dataValues)
                }
                console.log('payload', payload)
                // const data = {
                //     startDate: req.body.startDate,
                //     reason: req.body.reason,
                //     endDate: req.body.endDate,
                //     requestedTo: userDataById?._id ? userDataById?._id : "61d2971975cf2724596a05be",
                //     userId: req?.currentUser?._id,
                //     status: CONSTANTS.LEAVE_REQUEST_STATUS
                // }
                let dataPay = Object.assign({}, payload)
                // console.log(dataPay)
                const leaveRequestData = new leavesRequest(dataPay)
                // console.log('leaveRequestData', leaveRequestData)
                // leaveRequestData.save()
                // return res.status(200).json({ success: true, data: leaveRequestData });
            }
        } catch (error) {
            console.log(error);
        }

    }
}

module.exports = new LeavesRequestController