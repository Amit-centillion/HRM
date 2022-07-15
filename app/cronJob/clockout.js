const cron = require("node-cron");
const moment = require("moment");
const { UserSchema } = require("../models/user");
const Attendance = require("../models/attendence");
const mongoose = require("mongoose");
cron.schedule("0 23 * * * *", async () => {
    try {
        let users = await UserSchema.find();
        console.log("test", users)
        for (let i = 0; i < users.length; i++) {
            console.log("update")
            let todayDate = moment().startOf("day").toISOString();
            let attendeesRecord = await Attendance.findOne({

                user: users[i]._id,
                createdAt: { $gt: new Date(todayDate) },
            });
            console.log('attendeesRecord', attendeesRecord)
            if (!attendeesRecord?.clockOut) {
                if (!attendeesRecord.entry[attendeesRecord.entry.length - 1]?.out) {
                    let out = {
                        $push: {
                            entry: {
                                Out: moment().utc(false),
                            },
                        },
                    };
                    let outEntry = moment().toISOString();
                    payload = {};
                    let minutes = moment(outEntry).diff(
                        attendeesRecord.entry[attendeesRecord.entry.length - 1]?.In,
                        "minutes"
                    );
                    payload = {
                        ...payload,
                        ...out,
                        workingHours: minutes,
                        clockOut: outEntry,
                    };
                    console.log("payload", payload);

                    await Attendance.findOneAndUpdate(
                        { _id: attendeesRecord._id },
                        { ...payload },
                        {
                            upsert: true,
                            new: false,
                        }
                    );
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
});



// cron.schedule("5 * * * * *", async () => {
//     try {
//         let startDate = moment("2022-01-01").utc(true).startOf('day');
//         let EndDate = moment("2022-01-21").utc(true).endOf('day');
//         let Excludedate = moment("2022-01-14").utc(true).startOf('day');



//         let workingDaysDateArray = []
//         //Difference in number of days
//         let nonworkingDaysArray = [6, 0]
//         let diffrence = moment(EndDate).diff(startDate, "days")
//         for (let i = 0; i <= diffrence; i++) {
//             let weekday = moment(startDate).weekday()
//             if (!nonworkingDaysArray.includes(weekday)) {
//                 workingDaysDateArray.push(startDate)
//             }
//             if (moment(startDate).isSame(Excludedate)) {
//                 workingDaysDateArray.pop()
//             }
//             startDate = moment(startDate).add(1, "days")
//         }

//         let user = await UserSchema.find({
//             _id: {
//                 $nin: [
//                     mongoose.Types.ObjectId("61d2971975cf2724596a05be"),
//                     mongoose.Types.ObjectId("61d6764c66e74cf0a72aca5e"),
//                     mongoose.Types.ObjectId("61e961bac72bbf8269a07974")
//                 ]
//             }
//         })


//         let saveData = []

//         for (let i = 0; i < workingDaysDateArray.length; i++) {
//             for (let j = 0; j < user.length; j++) {
//                 let startTime = moment(workingDaysDateArray[i]).set("hour", 10).set("minute", 00).utc(true);
//                 let endTime = moment(workingDaysDateArray[i]).set("hour", 21).set("minute", 00).utc(true);
//                 let entry_payload = [
//                     {
//                         In: moment(startTime).utc(true)
//                     }, {
//                         Out: moment(endTime).utc(true)
//                     }
//                 ]
//                 let payload = {
//                     userId: mongoose.Types.ObjectId(user[j]._id),
//                     workDate: workingDaysDateArray[i],
//                     totalHours: 9,
//                     workingHours: 480,
//                     workDate: workingDaysDateArray[i],
//                     clockOut: moment(endTime).utc(true),
//                     clockIn: moment(startTime).utc(true),
//                     entry: entry_payload

//                 }
//                 saveData.push(payload);

//                 let AttendanceData = new Attendance(payload);
//                 await AttendanceData.save()

//                 console.log("j", j)
//             }
//             console.log("i", i)

//         }


//         exit;

//     } catch (err) {
//         console.log(err);
//     }
// });
