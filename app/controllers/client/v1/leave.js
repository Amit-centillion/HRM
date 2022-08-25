const { LeavesManagement } = require("../../../models/leave");
const { UserSchema } = require("../../../models/user");
const Attendance = require("../../../models/attendence");
const { holidaySchema } = require("../../../models/publicHoliday");
const moment = require("moment-timezone");
const commonFunction = require("../../../common/function");
let leavesLogs = commonFunction.fileLogs("leaves");

class LeaveController {
  async index(req, res) {
    let currentUser = await UserSchema.findOne(
      {
        _id: req.currentUser._id,
        isDeleted: false,
      },
      {
        role: 1,
        _id: 1,
      }
    ).populate({
      path: "role",
      select: ["name"],
    });
    let { page, limit, sortField, sortValue, sort_key, sort_direction, startDate, endDate } =
      req.query;
    let sort = {};
    let criteria = { isDeleted: false };
    if (sortField) {
      sort = {
        [sortField]: sortValue === "ASC" ? 1 : -1,
      };
    } else {
      sort = {
        createdAt: -1,
      };
    }
    if (currentUser.role.name == "USER") {
      criteria.userId = req.currentUser._id;
    }
    var populateData = {
      path: "userId",
      select: ["email", "firstname", "lastname", "profile", "totalAvailablePaidLeave", "profile", "designation", "totalAvailableOptionalLeave"],
    };
    var startDateRecord = moment(startDate);
    var endDateReacord = moment(endDate);

    if (startDate && endDate) {
      criteria["leaveFrom"] = {
        $gte: commonFunction.getUtcTime(
          startDateRecord,
          commonFunction.timezone,
          "YYYY/MM/DD HH:mm:ss"
        ),
        $lte: commonFunction.getUtcTime(
          endDateReacord,
          commonFunction.timezone,
          "YYYY/MM/DD HH:mm:ss"
        ),
      };
    }

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: { createdAt: -1 },
      populate: populateData,
    };

    let leave =
      req.query.page || req.query.limit
        ? await LeavesManagement.paginate(criteria, options)
        : await LeavesManagement.find({ criteria })
          .sort({
            createdAt: -1,
          })
          .populate({
            path: "userId",
            select: ["firstname", "lastname", "email", "profile", "totalAvailablePaidLeave", "profile", "designation", "totalAvailableOptionalLeave"],
          });

    return res.status(200).json({ success: true, data: leave });
  }

  /**
   * For Apply leave
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async applyLeave(req, res) {
    try {
      let date_array = [];
      let startDate = moment(req.body.leaveFrom);
      let endDate = moment(req.body.leaveTo).add(1, "days");
      let date = [];

      for (var m = moment(startDate); m.isBefore(endDate); m.add(1, "days")) {
        date.push(m.format("YYYY-MM-DD"));
      }

      console.log(date);
      console.log("date_array", date_array);
      let data = {
        ...req.body,
        leaveFrom: moment(req.body.leaveFrom).utc(true),
        leaveTo: moment(req.body.leaveTo).utc(true),
        status: "pending",
        differenceDate: date,
      };
      console.log("data", data);
      // differenceDate;
      leavesLogs.info("applyLeave api request data " + JSON.stringify(data));

      //find user data
      let userData = await UserSchema.findOne(
        {
          _id: req.params.id,
        },
        {
          totalAvailablePaidLeave: 1,
          totalUnpaidLeave: 1,
        }
      );
      let start = moment(data.leaveFrom, "YYYY-MM-DD");
      let end = moment(data.leaveTo, "YYYY-MM-DD");

      console.log("start", start);
      let leaveFlag = moment().isSameOrBefore(start, "days");
      //check valid leave apply or not
      if (leaveFlag) {
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
        let leaveDaysCount = commonFunction.workingDaysCount(start, end);
        let year = moment().format("YYYY");
        let publicHolidayList = await holidaySchema.findOne({
          isDeleted: false,
          year: year,
        });
        let publicHolidayCount = 0;
        publicHolidayList.holidayList.forEach((element) => {
          if (!(element.day == "Sunday" || element.day == "Satuerday")) {
            let date = moment(element.holidayDate, "YYYYY-MM-DD").format(
              "YYYY-MM-DD"
            );
            if (moment(date).isBetween(start, end)) {
              publicHolidayCount++;
            }
          }
        });
        leaveDaysCount = leaveDaysCount - publicHolidayCount;
        data.totalDay = leaveDaysCount * leaveCount;
        //update isPaid flag accroding to leave type
        if (
          (userData.totalAvailablePaidLeave >= data.totalDay &&
            data.type == "PaidLeave") ||
          data.type == "UnpaidLeave" ||
          data.type == "OptionalLeave"
        ) {
          let { id } = req.params;
          if (data.type == "PaidLeave") {
            data.isPaid = true;
          }
          if (data.type == "UnpaidLeave") {
            data.isPaid = false;
          }
          if (data.type == "OptionalLeave") {
            data.isOptional = true;
          }

          let leaveData = await new LeavesManagement({
            ...data,
            userId: id,
          });

          await leaveData.save(); //create leave document
          leavesLogs.info(
            "Leave data created successfully for userId :-" +
            req.currentUser._id +
            "Leave DocumentId :-" +
            leaveData._id
          );
          return res.status(200).json({ success: true, data: leaveData });
        } else {
          leavesLogs.info("Not Available for Paid Leave");
          return res
            .status(200)
            .json({ success: false, data: "Not Available for Paid Leave" });
        }
      } else {
        leavesLogs.info("Please Select Valid Date");
        return res
          .status(500)
          .json({ success: false, data: "Please Select Valid Date" });
      }
    } catch (error) {
      console.log("error", error);
      leavesLogs.error("Error while create leave doc" + JSON.stringify(error));
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Update leave Data
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async update(req, res) {
    try {
      let data = {
        ...req.body,
        leaveFrom: moment(req.body.leaveFrom).utc(true),
        leaveTo: moment(req.body.leaveTo).utc(true),
      };
      leavesLogs.info("Update api request data " + JSON.stringify(data));
      let start = moment(data.leaveFrom, "YYYY-MM-DD");
      let end = moment(data.leaveTo, "YYYY-MM-DD");
      let leaveFlag = moment().isSameOrBefore(start, "days");
      //check valid leave apply or not
      if (leaveFlag) {
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
        let leaveDaysCount = commonFunction.workingDaysCount(start, end);
        let currentYear = moment().format("YYYY");
        let publicHolidayList = await holidaySchema.findOne({
          isDeleted: false,
          year: currentYear,
        });

        let publicHolidayCount = 0;
        publicHolidayList.holidayList.forEach((element) => {
          if (!(element.day == "Sunday" || element.day == "Satuerday")) {
            let date = moment(element.holidayDate, "YYYY-MM-DD").format(
              "YYYY-MM-DD"
            );
            if (moment(date).isBetween(start, end)) {
              publicHolidayCount++;
            }
          }
        });
        leaveDaysCount = leaveDaysCount - publicHolidayCount;
        data.totalDay = leaveDaysCount * leaveCount;

        if (data.type == "PaidLeave") {
          data.isPaid = true;
        }
        if (data.type == "UnpaidLeave") {
          data.isPaid = false;
        }

        await LeavesManagement.updateOne(
          {
            _id: req.params.id,
          },
          data
        );
        leavesLogs.info(
          "Successfully leave data updated for leave docId:- " + req.params.id
        );
        return res.status(200).json({
          success: true,
          data: data,
          message: "Successfully leave Data Updated",
        });
      } else {
        leavesLogs.info("Please Select Valid Date");
        return res
          .status(500)
          .json({ success: false, data: "Please Select Valid Date" });
      }
    } catch (error) {
      leavesLogs.error("Error while create leave doc" + JSON.stringify(error));
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Cancel Leave
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async cancelLeave(req, res) {
    try {
      leavesLogs.info(
        "cancelLeave api request data " + JSON.stringify(req.body)
      );
      let leaveData = await LeavesManagement.findOne(
        {
          _id: req.params.id,
          isDeleted: false,
        },
        {
          totalDay: 1,
          isPaid: 1,
          isApproved: 1,
          userId: 1,
        }
      );
      if (leaveData.isApproved) {
        //get current leave data
        if (leaveData.isApproved) {
          //get user data
          let userData = await UserSchema.findOne(
            {
              _id: leaveData.userId,
            },
            {
              totalUnpaidLeave: 1,
              totalAvailablePaidLeave: 1,
            }
          );

          //chek leave type & update count
          if (leaveData.isPaid == true) {
            userData.totalAvailablePaidLeave =
              userData.totalAvailablePaidLeave - leaveData.totalDay;
          } else {
            userData.totalUnpaidLeave =
              userData.totalUnpaidLeave - leaveData.totalDay;
          }
          //update user data
          await UserSchema.updateOne(
            {
              _id: leaveData.userId,
            },
            {
              totalUnpaidLeave: userData.totalUnpaidLeave,
              totalAvailablePaidLeave: userData.totalAvailablePaidLeave,
            }
          );
        }
      }
      await LeavesManagement.updateOne(
        {
          _id: req.params.id,
        },
        {
          isDeleted: true,
          status: "cancel",
        }
      );
      leavesLogs.info("Successfully leave leave cancel");
      return res.status(200).json({
        success: true,
        data: {},
        message: "Successfully Leave Cancel",
      });
    } catch (error) {
      leavesLogs.error("Error while cancelLeave api" + JSON.stringify(error));
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Approve leave api
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async approveLeave(req, res) {
    try {
      let leaveData = await LeavesManagement.findOne({
        _id: req.params.id,
      }).populate({
        path: "userId",
        select: ["totalAvailablePaidLeave", "totalUnpaidLeave", "_id", "totalAvailableOptionalLeave"],
      });

      console.log('leaveData.totalDay', leaveData.totalDay)
      if (leaveData.isPaid == true) {
        leaveData.userId.totalAvailablePaidLeave =
          leaveData.userId.totalAvailablePaidLeave - leaveData.totalDay;
      }
      if (leaveData.isPaid == false) {
        leaveData.userId.totalUnpaidLeave =
          leaveData.userId.totalUnpaidLeave + leaveData.totalDay;
      }
      if (leaveData.isOptional == true) {
        leaveData.userId.totalAvailableOptionalLeave =
          leaveData.userId.totalAvailableOptionalLeave + leaveData.totalDay;
      }
      await UserSchema.updateOne(
        {
          _id: leaveData.userId._id,
        },
        {
          totalAvailablePaidLeave: leaveData.userId.totalAvailablePaidLeave,
          totalUnpaidLeave: leaveData.userId.totalUnpaidLeave,
          totalAvailableOptionalLeave: leaveData.userId.totalAvailableOptionalLeave,
        }
      );
      await LeavesManagement.updateOne(
        {
          _id: req.params.id,
        },
        {
          approvedBy: req.body.approvedBy,
          isApproved: true,
          status: "approved",
          approveDate: moment(),
        }
      );
      return res.status(200).json({
        success: true,
        data: {},
        message: "Successfully Leave Approved",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Reject leave api
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async rejectLeave(req, res) {
    try {
      leavesLogs.info("rejec leave api request data" + req.params.id);
      await LeavesManagement.updateOne(
        {
          _id: req.params.id,
        },
        {
          rejectedBy: req.body.rejectedBy,
          isApproved: false,
          status: "rejected",
          rejectDate: moment(),
        }
      );
      return res.status(200).json({
        success: true,
        data: {},
        message: "Successfully Leave Rejected",
      });
    } catch (error) {
      leavesLogs.error("Error while reject leave" + JSON.stringify(error));
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Get Current leave Data
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async getLeaveData(req, res) {
    try {
      leavesLogs.info("Request data of getLeaveData api " + req.params.id);
      let leaveData = await LeavesManagement.findOne({
        _id: req.params.id,
      });

      return res.status(200).json({
        success: true,
        data: leaveData,
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process getLeaveData api" + JSON.stringify(error)
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * For Get Current leave Data
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async publicHolidayList(req, res) {
    try {
      let currentYear = moment().format("YYYY");
      let publicHolidayList = await holidaySchema.findOne({
        isDeleted: false,
        year: currentYear,
      });
      return res.status(200).json({
        success: true,
        data: publicHolidayList,
        message: "",
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process publicHolidayList api" + JSON.stringify(error)
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async updatePublicHolidayList(req, res) {
    try {
      requestLogs.info("updatePublicHolidayList api , Requested params :- " + req.params.id + " Current User Id :- " + req.currentUser._id);
      let data = await holidaySchema.updateOne({
        _id: req.params.id,
        isDeleted: false
      }, {
        optionalHoliday: req.body.optionalHoliday,
      });
      // return res.status(200).json({ success: true,data:data, message: "Designation updated successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }


  async getUpcomingLeaves(req, res) {
    console.log('req.currentUser._id', req.currentUser._id)
    try {
      let date = moment();
      leavesLogs.info(
        "Request data of getUpcomingLeaves api " + req.currentUser._id

      );
      let condition = {
        isDeleted: {
          $ne: true,
        },
        status: "approved",
        userId: req.currentUser._id,
      };
      condition["leaveFrom"] = {
        $gte: commonFunction.getUtcTime(
          date,
          commonFunction.timezone,
          "YYYY/MM/DD HH:mm:ss"
        ),
      };

      let query = [
        {
          $match: condition,
        },
      ];
      let data = await LeavesManagement.aggregate(query).allowDiskUse(true);

      return res.status(200).json({
        success: true,
        data: data,
        message: "",
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process getUpcomingLeaves api" + JSON.stringify(error)
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAdminUpcomingLeaves(req, res) {
    try {
      let date = moment();
      leavesLogs.info(
        "Request data of getUpcomingLeaves api " + req.currentUser._id
      );
      let condition = {
        isDeleted: {
          $ne: true,
        },
      };
      condition["leaveFrom"] = {
        $gte: commonFunction.getUtcTime(
          date,
          commonFunction.timezone,
          "YYYY/MM/DD HH:mm:ss"
        ),
      };

      let query = [
        {
          $match: condition,
        },
      ];
      let data = await LeavesManagement.aggregate(query).allowDiskUse(true);

      return res.status(200).json({
        success: true,
        data: data,
        message: "",
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process getUpcomingLeaves api" + JSON.stringify(error)
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get upcoming holidayList
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async overviewDetails(req, res) {
    try {
      leavesLogs.info(
        "overviewDetails api request, UserID :- " + req.currentUser._id
      );
      let date = moment();
      let currentYear = moment().format("YYYY");
      let startOfMonth = moment().startOf("month").format("YYYY-MM-DD");
      let endOfMonth = moment().endOf("month").format("YYYY-MM-DD");

      let query = [
        {
          $match: {
            isDeleted: false,
            year: currentYear,
            holidayList: {
              $elemMatch: {
                holidayDate: {
                  $gte: commonFunction.getUtcTime(
                    date,
                    commonFunction.timezone,
                    "YYYY/MM/DD HH:mm:ss"
                  ),
                },
              },
            },
          },
        },
        { $unwind: "$holidayList" },
        {
          $match: {
            "holidayList.holidayDate": {
              $gte: commonFunction.getUtcTime(
                date,
                commonFunction.timezone,
                "YYYY/MM/DD HH:mm:ss"
              ),
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            holidayList: { $push: "$holidayList" },
            year: {
              $first: "$year",
            },
          },
        },
        { $project: { holidayList: 1, year: 1 } },
      ];
      let holidayList = await holidaySchema.aggregate(query);
      let pendingLeaveList = await LeavesManagement.find(
        {
          userId: req.currentUser._id,
          status: "pending",
          leaveFrom: {
            $gte: commonFunction.getUtcTime(
              startOfMonth,
              "-5:30",
              "YYYY/MM/DD"
            ),
          },
          leaveTo: {
            $lte: commonFunction.getUtcTime(endOfMonth, "-5:30", "YYYY/MM/DD"),
          },
        },
        {
          _id: 1,
          leaveFrom: 1,
          leaveTo: 1,
        }
      );
      let approveList = await LeavesManagement.find(
        {
          userId: req.currentUser._id,
          status: "approved",
          leaveFrom: {
            $gte: commonFunction.getUtcTime(
              startOfMonth,
              "-5:30",
              "YYYY/MM/DD"
            ),
          },
          leaveTo: {
            $lte: commonFunction.getUtcTime(endOfMonth, "-5:30", "YYYY/MM/DD"),
          },
        },
        {
          _id: 1,
          leaveFrom: 1,
          leaveTo: 1,
        }
      );
      let currentApproveList = await LeavesManagement.find(
        {
          userId: req.currentUser._id,
          status: "approved",
        })
      let condition = {
        clockOut: {
          $gte: commonFunction.getUtcTime(startOfMonth, "-5:30", "YYYY/MM/DD"),
          $lte: commonFunction.getUtcTime(endOfMonth, "-5:30", "YYYY/MM/DD"),
        },
        userId: req.currentUser._id,
      };
      startOfMonth = moment().startOf('month');
      endOfMonth = moment();
      let currentMonthAttendance = await Attendance.find({
        userId: req.currentUser._id,
        workDate: {
          $gte: commonFunction.getUtcTime(
            startOfMonth,
            commonFunction.timezone,
            "YYYY/MM/DD HH:mm:ss"
          ),
          $lte: commonFunction.getUtcTime(
            endOfMonth,
            commonFunction.timezone,
            "YYYY/MM/DD HH:mm:ss"
          ),
        },
      });
      console.log('currentMonthAttendance', currentMonthAttendance)
      let data = await getTotalWorkingDays(currentYear);
      let userList = await UserSchema.find({ isDeleted: false });
      let all_attendance = await Attendance.find({
        workDate: moment().startOf("day").utc(true),
      });
      let all_User_Attendance = await Attendance.find({
        userId: req.currentUser._id,
      });
      let resData = {
        holidayList:
          holidayList && holidayList[0].holidayList
            ? holidayList && holidayList[0].holidayList
            : holidayList,
        pendingLeaveListCount: pendingLeaveList?.length,
        approveList: approveList?.length,
        currentApproveList: currentApproveList?.length,
        totalAttendance: all_attendance?.length,
        userTotalAttendance: all_User_Attendance?.length,
        currentMonthAttendance: currentMonthAttendance?.length,
        totalDaysInMonth: data?.totalDaysInMonth,
        actualWorkingDaysInMonth: data?.actualWorkingDaysInMonth,
        userList: userList && userList?.length,
      };
      return res.status(200).json({
        success: true,
        data: resData,
        message: "Successfully get all upcoming holiday list",
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process overviewDetails api" + JSON.stringify(error)
      );
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // /**
  //  * FOr List leave data by UserId
  //  * @param {*} req
  //  * @param {*} res
  //  * @returns
  //  */
  // async show(req, res) {
  //   try {
  //     let { id } = req.params;
  //     let user = {};
  //     if (id) {
  //       user = { ...req.params._id, userId: id };
  //     } else {
  //       user = { ...req.params._id };
  //     }
  //     let { page, limit, sortField, sortValue } = req.query;
  //     let sort = {};
  //     let whereClause = { isDeleted: false };
  //     if (sortField) {
  //       sort = {
  //         [sortField]: sortValue === "ASC" ? -1 : 1,
  //       };
  //     } else {
  //       sort = {
  //         name: 1,
  //       };
  //     }

  //     let leave = await LeavesManagement.find(user, whereClause)
  //       .skip(page > 0 ? +limit * (+page - 1) : 0)
  //       .limit(+limit || 20)
  //       .sort(sort)
  //       .populate({
  //         path: "userId",
  //         select: ["firstname", "lastname", "email", "profile"],
  //       });
  //     return res
  //       .status(200)
  //       .json({ success: true, data: leave.docs ? leave.docs : leave });
  //   } catch (error) {
  //     return res.status(500).json({ success: false, message: error.message });
  //   }
  // }
}

let getTotalWorkingDays = (currentYear) => {
  return new Promise(async (resolve, reject) => {
    try {
      let startDate = moment().startOf("month");
      let endDate = moment().endOf("month");
      let query = [
        {
          $match: {
            isDeleted: false,
            year: currentYear,
            holidayList: {
              $elemMatch: {
                holidayDate: {
                  $gte: commonFunction.getUtcTime(
                    startDate,
                    "-05:30",
                    "YYYY/MM/DD HH:mm:ss"
                  ),
                  $lte: commonFunction.getUtcTime(
                    endDate,
                    "-05:30",
                    "YYYY/MM/DD HH:mm:ss"
                  ),
                },
              },
            },
          },
        },
        { $unwind: "$holidayList" },
        {
          $match: {
            "holidayList.holidayDate": {
              $gte: commonFunction.getUtcTime(
                startDate,
                "-05:30",
                "YYYY/MM/DD HH:mm:ss"
              ),
              $lte: commonFunction.getUtcTime(
                endDate,
                "-05:30",
                "YYYY/MM/DD HH:mm:ss"
              ),
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            holidayList: { $push: "$holidayList" },
            year: {
              $first: "$year",
            },
          },
        },
        { $project: { holidayList: 1, year: 1 } },
      ];
      let currentMonthHolidayList = await holidaySchema.aggregate(query);
      let totalDays = commonFunction.workingDaysCount(startDate, endDate);
      let publicHolidayCount = 0;
      if (
        currentMonthHolidayList &&
        currentMonthHolidayList.length > 0 &&
        currentMonthHolidayList[0] &&
        currentMonthHolidayList[0].holidayList
      ) {
        currentMonthHolidayList[0].holidayList.forEach((element) => {
          if (!(element.day == "Sunday" || element.day == "Satuerday")) {
            let date = moment(element.holidayDate, "YYYYY-MM-DD").format(
              "YYYY-MM-DD"
            );
            if (moment(date).isBetween(startDate, endDate)) {
              publicHolidayCount++;
            }
          }
        });
      }
      resolve({
        totalDaysInMonth: totalDays,
        actualWorkingDaysInMonth: totalDays - publicHolidayCount,
      });
    } catch (error) {
      leavesLogs.error(
        "Error while process getTotalWorkingDays fun" + JSON.stringify(error)
      );
      reject(error);
    }
  });
};

module.exports = new LeaveController();
