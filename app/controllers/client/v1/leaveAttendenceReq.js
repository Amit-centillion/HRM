
const { leaveAttendenceReqSchema } = require("../../../models/leaveAttendenceReq");
const AttendanceSchema = require("../../../models/attendence");
const { UserSchema } = require("../../../models/user");
const { LeavesManagement } = require("../../../models/leave");
const moment = require("moment-timezone");
const commonFunction = require("../../../common/function");
let requestLogs = commonFunction.fileLogs("leaveAttendanceRequest");
class leaveAttendenceController {

    async index(req, res) {
        requestLogs.info("Index api ,UserId :- " + req.currentUser._id);
        let { page, limit, sortField, sortValue, sort_key, sort_direction } = req.query;
        let sort = {};
        let criteria = { isDeleted: false };
        let currentUser = await UserSchema.findOne({
            _id: req.currentUser._id,
            isDeleted: false
        }, {
            role: 1,
            _id: 1
        }).populate({
            path: "role",
            select: ["name"],
        });
        if (sortField) {
            sort = {
                [sortField]: sortValue === "ASC" ? 1 : -1,
            };
        } else {
            sort = {
                createdAt: -1,
            };
        }
        var populateData = {
            path: "userId",
            select: ["email", "firstname", "lastname", "profile", "totalAvailablePaidLeave", "designation"],
        };
        const options = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
            sort: { createdAt: -1 },
            populate: populateData,
        };
        if (currentUser.role.name == "USER") {
            criteria.userId = req.currentUser._id;
        }
        let leave =
            req.query.page || req.query.limit
                ? await leaveAttendenceReqSchema.paginate(criteria, options)
                : await leaveAttendenceReqSchema.find(criteria)
                    .sort({
                        createdAt: -1,
                    })
                    .populate({
                        path: "userId",
                        select: ["firstname", "lastname", "email", "profile", "totalAvailablePaidLeave", "designation"],
                    });
        return res
            .status(200)
            .json({ success: true, data: leave.docs ? leave.docs : leave });
    }

    /**
     * Create request entry for leave/attendence
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * 
     */
    async create(req, res) {
        try {
            requestLogs.info("Create api call by currentUser Id :-" + req.currentUser._id + " ,Request Data :- " + JSON.stringify(req.body))
            let userData = await UserSchema.findOne(
                {
                    _id: req.currentUser._id,
                    isDeleted: false
                },
                {
                    totalAvailablePaidLeave: 1,
                    totalUnpaidLeave: 1,
                    teamLeader: 1
                }
            );
            let userDataById = await UserSchema.findOne({ employeeType: "ADMIN" });

            let data = {
                ...req.body,
                startDate: moment(req.body.startDate).utc(false),
                endDate: moment(req.body.endDate).utc(false),
                requestedTo: userDataById?._id ? userDataById?._id : "61d2971975cf2724596a05be",
                userId: req?.currentUser?._id,
                status: "Pending"
            }
            console.log('data', data)
            let resData = await processData(req.body, data, userData);
            console.log('resData', resData)
            if (resData && resData.data && resData.isCreatedFlag && Object.keys(resData.data).length > 0) {
                let reqData = new leaveAttendenceReqSchema(resData.data);
                await reqData.save();
                return res.status(200).json({ success: true, message: data.requestType + " Request added successfully" });
            } else {
                return res.status(500).json({ success: false, message: resData.message });
            }
        } catch (error) {
            console.log('error', error)
            requestLogs.error("Error while calling create api UserId :- " + req.currentUser._id + " ,Error :- " + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Approve Request for leave/attendence by team leader
     * @param {*} req 
     * @param {*} res 
     * @returns object
     */
    async approve(req, res) {
        try {
            requestLogs.info("Approve APi ,Requested Params :- " + req.params.id + " CurrentUserId :- " + req.currentUser._id);
            let requestedData = await leaveAttendenceReqSchema.findOne({
                _id: req.params.id
            }).populate({
                path: "userId",
                select: ["totalAvailablePaidLeave", "totalUnpaidLeave", "_id", "totalAvailableOptionalLeave"],
            });
            let isUpdateFlag = false;
            if (requestedData) {
                if (requestedData.requestType == "attendance") {
                    let attendenceData = {
                        userId: requestedData.userId,
                        clockIn: moment(requestedData.startDate).utc(false),
                        workDate: moment(requestedData.startDate).startOf("day").utc(true).toISOString(),
                        clockOut: moment(requestedData.endDate).utc(false),
                        workingHours: requestedData.totalMinute
                    }
                    let data = await new AttendanceSchema({
                        ...attendenceData,
                    });
                    await data.save();
                    isUpdateFlag = true;
                }
                if (requestedData.requestType == "leave") {
                    let data = {
                        reason: requestedData.reason,
                        leaveType: requestedData.leaveType,
                        approvedBy: req.currentUser._id,
                        isApproved: true,
                        status: "approved",
                        approveDate: moment(),
                        leaveFrom: requestedData.startDate,
                        leaveTo: requestedData.endDate,
                        totalDay: requestedData.totalDay,
                        userId: requestedData.userId
                    }
                    if (requestedData.type == "PaidLeave") {
                        data.isPaid = true;
                    }
                    if (requestedData.type == "UnpaidLeave") {
                        data.isPaid = false;
                    }
                    if (requestedData.type == "OptionalLeave") {
                        data.isOptional = true;
                    }

                    if (data.isPaid == true) {
                        requestedData.userId.totalAvailablePaidLeave =
                            requestedData.userId.totalAvailablePaidLeave - requestedData.totalDay;
                    }
                    if (data.isPaid == false) {
                        requestedData.userId.totalUnpaidLeave =
                            requestedData.userId.totalUnpaidLeave + requestedData.totalDay;
                    }
                    if (data.isOptional == true) {
                        requestedData.userId.totalAvailableOptionalLeave =
                            requestedData.userId.totalAvailableOptionalLeave + requestedData.totalDay;
                    }

                    let leaveData = await new LeavesManagement({
                        ...data,
                    });

                    await leaveData.save(); //create leave document
                    await UserSchema.updateOne(
                        {
                            _id: requestedData.userId,
                        },
                        {
                            totalAvailablePaidLeave: requestedData.userId.totalAvailablePaidLeave,
                            totalUnpaidLeave: requestedData.userId.totalUnpaidLeave,
                        }
                    );
                    isUpdateFlag = true;
                }
                if (isUpdateFlag) {
                    let requesTypeData = await leaveAttendenceReqSchema.findOneAndUpdate({
                        _id: req.params.id
                    }, {

                        approvedBy: req.currentUser._id,
                        status: "Approved",
                        approveDate: moment()
                    });
                    return res.status(200).json({ success: true, message: "Successfully " + requesTypeData.requestType + "Document Added" });
                } else {
                    return res.status(500).json({ success: false, message: "Error while proces request data" });
                }
            } else {
                return res.status(500).json({ success: false, message: "Error while update document" });
            }
        } catch (error) {
            requestLogs.error("Error while calling approve api UserId :- " + req.currentUser._id + " ,Error :- " + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Get All request by Id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async getAllPendingRequest(req, res) {
        try {
            requestLogs.info("getAllPendingRequest APi ,Requested Params :- " + req.params.id + " CurrentUserId :- " + req.currentUser._id);
            let requestedData = await leaveAttendenceReqSchema.find({
                requestedTo: req.currentUser._id,
                isDeleted: false,
                status: "Pending"
            }).populate({
                path: "userId",
                select: ["firstname", "lastname", "email", "profile", "totalAvailablePaidLeave", "designation"],
            });
            return res.status(200).json({ success: true, message: "Successfully get all requests documents", data: requestedData });
        } catch (error) {
            requestLogs.error("Error while calling getAllPendingRequest api UserId :- " + req.currentUser._id + " ,Error :- " + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Delete Request enry by user id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async delete(req, res) {
        try {
            requestLogs.info("delete APi ,Requested Params :- " + req.params.id);
            await leaveAttendenceReqSchema.updateOne({
                _id: req.params.id,
            }, {
                isDeleted: true
            });
            return res.status(200).json({ success: true, message: "Successfully deleted requestedEntry" });
        } catch (error) {
            requestLogs.error("Error while calling delete api ,Error :- " + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Reject request of leaveAttandance
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async rejectRequest(req, res) {
        try {
            requestLogs.info("rejectRequest api , Requested params :- " + req.params.id + " Current User Id :- " + req.currentUser._id);
            await leaveAttendenceReqSchema.updateOne({
                _id: req.params.id,
                isDeleted: false
            }, {
                status: "Rejected",
                rejectedBy: req.currentUser._id,
                rejectDate: moment()
            });
            return res.status(200).json({ success: true, message: "Successfully Rejected requestedEntry" });
        } catch (error) {
            requestLogs.error("Error while calling rejectRequest api ,Error :- " + JSON.stringify(error), " CurrentUser Id :- " + req.currentUser._id);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Update leaveAtandance Data
     * @param {*} req object
     * @param {*} res 
     * @returns 
     */
    async update(req, res) {
        try {
            requestLogs.info("update api , Current User Id :- " + req.currentUser._id + " ,request Body :- " + JSON.stringify(req.body));
            let userData = await UserSchema.findOne(
                {
                    _id: req.currentUser._id,
                    isDeleted: false
                },
                {
                    totalAvailablePaidLeave: 1,
                    totalUnpaidLeave: 1,
                    teamLeader: 1
                }
            );
            let data = {
                ...req.body,
                startDate: moment(req.body.startDate).utc(false),
                endDate: moment(req.body.endDate).utc(false)
            }
            let resData = await processData(req.body, data, userData);
            if (resData && resData.data && resData.isCreatedFlag && Object.keys(resData.data).length > 0) {
                await leaveAttendenceReqSchema.updateOne(
                    {
                        _id: req.params.id,
                    },
                    resData.data
                );
                return res.status(200).json({ success: true, data: {}, message: data.requestType + " Request updated successfully" });
            } else {
                return res.status(500).json({ success: false, message: resData.message });
            }
        } catch (error) {
            requestLogs.error("Error while calling update api ,Error :- " + JSON.stringify(error), " CurrentUser Id :- " + req.currentUser._id);
            return res
                .status(500)
                .json({ success: false, message: error.message });

        }
    }

    /**
     * Get LeaveAttandance Document by Id
     * @param {*} req  id of document
     * @param {*} res object
     * @returns 
     */
    async getDataById(req, res) {
        try {
            requestLogs.info("getDataById APi ,Requested Params :- " + req.params.id);
            let data = await leaveAttendenceReqSchema.findOne({
                _id: req.params.id,
                isDeleted: false
            });
            return res.status(200).json({ success: true, message: "Successfully get document", data: data });
        } catch {
            requestLogs.error("Error while calling getDataById api ,Error :- " + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

//prpare data for leaveAttance request
const processData = (reqData, data, userData) => {
    return new Promise((resolve, reject) => {

        let start = moment(reqData.startDate, "YYYY-MM-DD")
        let currentDate = moment()
        let leaveFlag = moment(currentDate).isAfter(start, "days");
        let leaveDaysCount = commonFunction.workingDaysCount(data.startDate, data.endDate);
        let publicHolidayList = {
            holidayList: [
                {
                    holidayName: "Makar Sankranti",
                    holidayDate: "2022/01/14",
                },
                {
                    holidayName: "Republic Day",
                    holidayDate: "2022/01/26",
                },
                {
                    holidayName: "Holi",
                    holidayDate: "2022/03/18",
                },
                {
                    holidayName: "Ramzan Eid",
                    holidayDate: "2022/05/03",
                },
                {
                    holidayName: "Rakshbandhan",
                    holidayDate: "2022/08/11",
                },
                {
                    holidayName: "Independence Day",
                    holidayDate: "2022/08/15",
                },
                {
                    holidayName: "Janmashtami",
                    holidayDate: "2022/08/18",
                },
                {
                    holidayName: "Diwali",
                    holidayDate: "2022/10/24",
                },
                {
                    holidayName: "New Year",
                    holidayDate: "2022/10/25",
                },
                {
                    holidayName: "Bhai Dooj",
                    holidayDate: "2022/10/26",
                },
                {
                    holidayName: "Christmas",
                    holidayDate: "2022/12/25",
                },
            ],
            year: "2022"
        }
        let publicHolidayCount = 0;
        publicHolidayList.holidayList.forEach((element) => {
            if (!(element.day == "Sunday" || element.day == "Satuerday")) {
                let date = moment(element.holidayDate, "YYYY-MM-DD").format(
                    "YYYY-MM-DD"
                );
                if (moment(date).isBetween(data.startDate, data.endDate) || moment(date).isSame(data.startDate) || moment(date).isSame(data.endDate)) {
                    publicHolidayCount++;
                }
            }
        });
        leaveDaysCount = leaveDaysCount - publicHolidayCount;
        //check valid leave apply or not
        if (leaveFlag && leaveDaysCount > 0) {
            if (reqData.requestType == "leave") {
                let leaveCount;
                if (
                    data.leaveType == "First-Half-Leave" ||
                    data.leaveType == "Second-Half-Leave"
                ) {
                    leaveCount = 0.5;
                }
                if (data.leaveType == "FullLeave") {
                    leaveCount = 1;
                }
                data.totalDay = leaveDaysCount * leaveCount;
                //update isPaid flag accroding to leave type
                if (
                    (userData.totalAvailablePaidLeave >= data.totalDay &&
                        data.type == "PaidLeave") ||
                    data.type == "UnpaidLeave" || data.type == "OptionalLeave"
                ) {
                    resolve({
                        isCreatedFlag: true,
                        data: data
                    });
                } else {
                    resolve({
                        isCreatedFlag: false,
                        data: {},
                        message: "Not Available for Paid Leave"
                    });
                }
            } else if (reqData.requestType == "attendance") {
                if (moment(moment(data.startDate).format("YYYY-MM-DD")).isSame(moment(data.endDate).format("YYYY-MM-DD"))) {
                    let clockInDate = moment(data.startDate, "YYYY-MM-DDTHH:mm:ss");
                    let clockOutDate = moment(data.endDate, "YYYY-MM-DDTHH:mm:ss");
                    data.totalMinute = clockOutDate.diff(clockInDate, 'second') / 60;
                    resolve({
                        isCreatedFlag: true,
                        data: data
                    });
                } else {
                    resolve({
                        isCreatedFlag: false,
                        data: {},
                        message: "Please Select valid date for attendence request"
                    });
                }
            }
        } else {
            resolve({
                isCreatedFlag: false,
                data: {},
                message: "Please Select valid date"
            });
        }
    })
}


module.exports = new leaveAttendenceController();