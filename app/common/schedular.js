module.exports = {
    scheduler: {
        checkoutMailForAttendance: {
            time: '* * * * *',
            file: 'attendanceMail.js',
            active: false
        }
    }
};