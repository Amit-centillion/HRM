const cron = require('cron');
const mailer = require("../utils/sendMail");
const moment = require("moment-timezone");
const attendanceSchema = require("../models/attendence");
const { scheduler } = require('../common/schedular');
const commonFunction = require("../common/function");
let checkoutMailForAttendance = commonFunction.fileLogs("checkoutMailForAttendance");

// const checkoutMailForAttendance = commonFn
/**
 * Cron Job script is used for send mail if user forgot to logout
 */
//  checkoutMailForAttendance

new cron.CronJob(scheduler.checkoutMailForAttendance.time, async () => {
    try {
        checkoutMailForAttendance.info("Cron Started");
        let perviousDate = moment().subtract(1, 'days');
        perviousDate = moment(perviousDate);
        let condition = {
            clockIn: {
                $gte: new Date(perviousDate),
            },
            clockOut: {
                $exists: false
            },
            createdAt: {
                $gte: new Date(perviousDate)
            }
        }
        checkoutMailForAttendance.info(condition);
        let attendeesList = await attendanceSchema.find(condition).populate({
            path: "userId",
            select: ["email", "_id"],
        });

        checkoutMailForAttendance.info("Total attendance data checkout entry not found :" + attendeesList.length)
        if (attendeesList && attendeesList.length > 0) {
            checkoutMailForAttendance.info("Start Process for send mail to user");
            await processData(attendeesList);
            checkoutMailForAttendance.info("Process done for send mail for checkOut Entry");
        } else {
            checkoutMailForAttendance.info("No Attandance data found for checkout entry");
        }
    } catch (error) {
        checkoutMailForAttendance.error("Error In attendanceMail Cron " + error);
        checkoutMailForAttendance.error("Error while run cron for send mail to user for remind checkout entry");
    }

}, null, true).start();

/**
 * Process attandance Data for send mail
 * @param {*} data 
 * @returns 
 */
const processData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (data && data.length > 0) {
                let currentData = data.pop();
                let emailData = {
                    to: currentData.userId.email,
                    from: "poojagohelcs03@gmail.com",
                    subject: "Need TO CHECKOUT FOR YesterDay",
                    html: `<html>Need TO Checkout</html>`
                }
                const sendEmail = await mailer.sendMail(
                    emailData.to,
                    emailData.from,
                    emailData.subject,
                    emailData.html,
                );
                if (sendEmail[0].statusCode != 202) {
                    checkoutMailForAttendance.info("Mail not send to " + currentData.userId.email + "  User Id :-" + currentData.userId._id);
                } else {
                    checkoutMailForAttendance.info("Send Mail to " + currentData.userId.email + "  User Id :-" + currentData.userId._id);
                }
                resolve(processData(data));
            } else {
                checkoutMailForAttendance.info("All Attendance Data process data");
                resolve(true);
            }
        } catch (error) {
            checkoutMailForAttendance.info("Error while Process Data for attendance" + error);
            reject(error);
        }
    })
}
