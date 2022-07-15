const cron = require("node-cron");
const moment = require("moment");
const { UserSchema } = require("../models/user");
const {Attendance} = require("../models/attendence");
const {LeavesManagement} = require("../models/leave");
const { holidaySchema } = require("../models/publicHoliday");

cron.schedule("*/2 * * * *", async () => {
    let data = await holidaySchema.find()
    if (data.length > 0) {
        data.forEach(element => {
            element?.holidayList.forEach(element => {
                let date = moment(element.holidayDate).format("YYYY-MM-DD")
                LeavesManagement.find()

                // console.log('date', date)
                
            })

        })
    }

});

// const holidayData = async () => {
//     let data = await holidaySchema.find()
//     if (data.length > 0) {
//         data.forEach(element => {
//             element?.holidayList.forEach(element => {
//                 let date = moment(element.holidayDate).format("YYYY-MM-DD")
                
//             })

//         })
//     }
// }