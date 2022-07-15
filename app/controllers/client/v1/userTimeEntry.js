const UserTimeEntry = require("../../../models/user-time-entry");
const { UserSchema } = require("../../../models/user");
const { CONSTANTS } = require("../../../constants");
const moment = require("moment-timezone");
const mongoose = require("mongoose");

class UserTimeEntryController {
    logTimeEntry = async (req, res) => {
        try {
            const currentUserId = req.currentUser._id;
            const userLastEntry = await this.getCurrentUserLastTimeEntry(currentUserId);
            if (userLastEntry) {
                let newClockType;
                if (userLastEntry.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN) {
                    newClockType = CONSTANTS.CLOCK_TYPE.CLOCK_OUT;
                } else {
                    newClockType = CONSTANTS.CLOCK_TYPE.CLOCK_IN;
                }

                await this.createLogEntry(newClockType, currentUserId);
            } else {
                await this.createLogEntry(CONSTANTS.CLOCK_TYPE.CLOCK_IN, currentUserId);
            }

            return res.status(200).json({ success: true, data: "User time entry created successfully" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getUserClockStatus = async (req, res) => {
        try {
            const currentUserId = req.currentUser._id;
            let returnValue = await this.getCurrentUserLastTimeEntry(currentUserId);
            return res.status(200).json({ success: true, data: { userId: currentUserId, clocked_in: returnValue && returnValue.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN ? true : false } });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    removeTimeEntry = async (req, res) => {
        try {
            if (req.body?.out) {
                var data = [
                    req.body?.in,
                    req.body?.out
                ]
                await UserTimeEntry.deleteMany({ _id: { $in: [...data] } });
            } else {
                await UserTimeEntry.remove({ _id: req.body?.in });
            }
            return res.status(200).json({ success: true, message: "Entry removed successfully" });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getTimeEntriesByUserId = async (req, res) => {
        try {
            let returnValue = {};
            let userId = req.currentUser._id;
            if (req.body.userId) {
                userId = req.body.userId;
            }

            let startDate, endDate;
            if (req.body.startDate) {
                startDate = req.body.startDate;
                endDate = req.body.endDate ? new Date(req.body.endDate).setHours(23, 59, 59, 59) : new Date().setHours(23, 59, 59, 59);
            }

            let userEntries;
            if (startDate && endDate) {
                userEntries = await this.getUserEntryByGroupOfDay(userId, startDate, endDate);
            } else {
                userEntries = await this.getUserEntryByGroupOfDay(userId, "", "");

            }
            let userData = await UserSchema.findOne({ _id: mongoose.Types.ObjectId(userId) })

            // console.log('userEntries', userEntries)
            // if (userEntries?.length > 0) {
            //     returnValue = { ...userEntries[0].userId._doc };
            //     returnValue.timeEntries = this.getSingleUserEntries(userEntries).reverse();
            // }
            userEntries = {
                userEntries,
                user: userData
            }

            returnValue.userId = userId;
            return res.status(200).json({ success: true, data: userEntries });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getTodayTimeEntries = async (req, res) => {
        try {
            let returnValue = [];
            const users = await this.getTodayEntriesForAllUsers();
            users.forEach(user => {
                const userExisted = returnValue.find(r => r._id === user.userId._id);
                if (userExisted) {
                    const entry = userExisted.timeEntries[userExisted.timeEntries.length - 1];
                    if (entry && entry.time_in && !entry.time_out) {
                        if (user?.timeStamp) {
                            entry.time_out = moment(user.timeStamp).utcOffset("+5:30").format("hh:mm a");
                            entry.OutDate = user.createdAt
                        }
                    } else {
                        userExisted.timeEntries.push({ time_in: moment(user.timeStamp).utcOffset("+5:30").format("hh:mm a"), InDate: user.createdAt, create_date: moment(user.createdAt).format("MM-DD-YYYY") });
                    }
                } else {
                    const userObj = { ...user.userId._doc };
                    userObj.timeEntries = [];

                    if (user.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN) {
                        userObj.timeEntries.push({ time_in: moment(user.timeStamp).utcOffset("+5:30").format("hh:mm a"), InDate: user.createdAt, create_date: moment(user.createdAt).format("MM-DD-YYYY") })
                    } else {
                        if (user?.timeStamp) {
                            userObj.timeEntries.push({ time_out: moment(user.timeStamp).utcOffset("+5:30").format("hh:mm a"), OutDate: user.createdAt })
                        }
                    }

                    returnValue.push(userObj);
                }
            });
            // console.log('returnValue', returnValue[0]?.timeEntries)

            return res.status(200).json({ success: true, data: returnValue });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getSingleUserEntries = (userEntries) => {
        let returnValue = [];
        let entry;
        if (userEntries?.length) {
            for (let i = 0; i < userEntries.length; i++) {

            }

            userEntries.forEach((userEntry) => {
                if (userEntry.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN) {
                    entry = {};
                    console.log('(userEntry.in', userEntry.timeStamp)
                    entry.time_in = moment(userEntry.timeStamp).utcOffset("+5:30").format("hh:mm a");
                    entry.create_date = moment(userEntry.createdAt).format("MM-DD-YYYY");
                    entry.InDate = userEntry.createdAt;
                    returnValue.push(entry);
                } else {
                    console.log('(userEntry.out', userEntry.timeStamp)
                    entry.time_out = moment(userEntry.timeStamp, "HH:mm").format("hh:mm A");
                    entry.OutDate = userEntry.timeStamp;
                    returnValue.push(entry);
                }
            });
        }
        console.log('returnValue', returnValue)
        return returnValue;
    }

    createLogEntry = async (clockType, userId) => {
        await UserTimeEntry.create({ type: clockType, timeStamp: Date.now(), userId: userId, isDeleted: false });
    }

    getCurrentUserLastTimeEntry = async (userId) => {
        var userEntries = await this.getCurrentUserTimeEntries(userId);
        if (userEntries && userEntries.length > 0) {
            return userEntries.reverse()[0];
        } else {
            return null;
        }
    }

    getUserTimeEntriesDateRange = async (userId, start, end) => {
        var userEntries;
        console.log('start', start)
        console.log('end', end)
        if (start && end) {
            userEntries = await UserTimeEntry.find({
                userId: userId,
                isDeleted: false,
                timeStamp: {
                    $gte: start,
                    $lte: end
                }
            }).populate({
                path: "userId",
                select: ["firstname", "lastname", "email", "profile"],
            });
        } else {
            userEntries = await UserTimeEntry.find({
                userId: userId,
                isDeleted: false,
            }).populate({
                path: "userId",
                select: ["firstname", "lastname", "email", "profile"],
            });
        }

        return userEntries;
    }

    getUserEntryByGroupOfDay = async (userId, start, end) => {
        let payload = { userId: mongoose.Types.ObjectId(userId), }
        if (start && end) {
            payload = {
                ...payload,
                timeStamp: {
                    $gte: new Date(start),
                    $lte: new Date()
                }
            }
        }
        let userData = await UserTimeEntry.aggregate([
            {
                $match: {
                    ...payload

                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timeStamp" } },
                    list: { $push: "$$ROOT" },
                }
            },
        ]);
        console.log('Data', userData)
        return userData
    }

    getCurrentUserTimeEntries = async (userId) => {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        var userEntries = await UserTimeEntry.find({
            userId: userId,
            isDeleted: false,
            timeStamp: {
                $gte: startOfToday
            }
        }).populate({
            path: "userId",
            select: ["firstname", "lastname", "email", "profile"],
        });;

        return userEntries;
    }

    getTodayEntriesForAllUsers = async () => {
        var startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        var userEntries = await UserTimeEntry.find({
            isDeleted: false,
            timeStamp: {
                $gte: startOfToday
            }
        }).populate({
            path: "userId",
            select: ["firstname", "lastname", "email", "profile"],
        });

        return userEntries;
    }
}

module.exports = new UserTimeEntryController();

