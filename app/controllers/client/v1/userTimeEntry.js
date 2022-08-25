const UserTimeEntry = require("../../../models/user-time-entry");
const { CONSTANTS } = require("../../../constants");

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
            const currentUserId = req.currentUser._id;
            await UserTimeEntry.remove({ userId: currentUserId });
            return res.status(200).json({ success: true, data: "Entry removed successfully" });
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
                endDate = req.body.endDate ? req.body.endDate : new Date().setHours(23, 59, 59, 59);
            }

            let userEntries;
            if (startDate && endDate) {
                userEntries = await this.getUserTimeEntriesDateRange(userId, startDate, endDate);
            } else {
                userEntries = await this.getCurrentUserTimeEntries(userId);
            }

            if (userEntries?.length > 0) {
                returnValue = { ...userEntries[0].userId._doc };
                returnValue.timeEntries = this.getSingleUserEntries(userEntries).reverse();
            }

            returnValue.userId = userId;
            return res.status(200).json({ success: true, data: returnValue });
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
                        entry.time_out = user.timeStamp;
                    } else {
                        userExisted.timeEntries.push({ time_in: user.timeStamp });
                    }
                } else {
                    const userObj = { ...user.userId._doc };
                    userObj.timeEntries = [];

                    console.log('userObj', userObj);
                    if (user.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN) {
                        userObj.timeEntries.push({ time_in: user.timeStamp })
                    } else {
                        userObj.timeEntries.push({ time_out: user.timeStamp })
                    }

                    returnValue.push(userObj);
                }
            });

            return res.status(200).json({ success: true, data: returnValue });
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    getSingleUserEntries = (userEntries) => {
        let returnValue = [];
        let entry;
        if (userEntries?.length) {
            userEntries.forEach((userEntry) => {
                if (userEntry.type === CONSTANTS.CLOCK_TYPE.CLOCK_IN) {
                    entry = {};
                    entry.time_in = userEntry.timeStamp;
                    returnValue.push(entry);
                } else {
                    entry.time_out = userEntry.timeStamp;
                }
            });
        }

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
        var userEntries = await UserTimeEntry.find({
            userId: userId,
            isDeleted: false,
            timeStamp: {
                $gte: start,
                $lte: end
            }
        }).populate({
            path: "userId",
            select: ["firstname", "lastname", "email", "profile"],
        });;

        return userEntries;
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

