const moment = require("moment-timezone");

module.exports = {

    timezone: "-5:30",

    fileLogs(logName) {
        return require('simple-node-logger').createRollingFileLogger({
            logDirectory: 'logs',
            fileNamePattern: logName + '_<DATE>.log',
            dateFormat: 'YYYY_MM_DD',
            timestampFormat: 'YYYY-MM-DD HH:mm:ss'
        });
    },

    workingDaysCount(start, end) {
        var first = start.clone().endOf("week"); // end of first week
        var last = end.clone().startOf("week"); // start of last week
        var days = (last.diff(first, "days") * 5) / 7; // this will always multiply of 7
        var wfirst = first.day() - start.day(); // check first week
        if (start.day() == 0) --wfirst; // -1 if start with sunday
        var wlast = end.day() - last.day(); // check last week
        if (end.day() == 6) --wlast; // -1 if end with saturday
        return wfirst + Math.floor(days) + wlast; // get the total
    },

    /**
     * Function is used for get utc time
     * @param {*} input_time
     * @param {*} utc_offset
     * @param {*} input_format
     * @param {*} output_format
     */
    getUtcTime(
        input_time,
        utc_offset,
        input_format,
        output_format = true
    ) {
        let dateObject = moment(input_time, input_format);
        if (output_format == true) {
            return dateObject
                .add(convertUtcOffsetToMinute(utc_offset), "minute")
                .toDate();
        } else {
            return dateObject
                .add(convertUtcOffsetToMinute(utc_offset), "minute")
                .format(output_format);
        }
    },


}

/**
  * This function is used for convert timezone into minutes
  * @param {*} tz
  */
const convertUtcOffsetToMinute = (tz) => {
    let offset = tz.split(":");
    offset[0] = parseInt(offset[0]);
    offset[1] = parseInt(offset[1]);
    let tz_minute = Math.abs(offset[0]) * 60 + Math.abs(offset[1]);
    if (offset[0] < 0) {
        tz_minute = tz_minute * -1;
    }
    return tz_minute * -1;
}