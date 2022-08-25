const SalarySchema = require("../../../models/salary");
const attendance = require("../../../models/attendence");
class SalaryController {
  async index(req, res) {
    try {
      let criteria = {
        isDeleted: false,
      };
      let salary = await SalarySchema.find(req.params._id, criteria);
      return res.status(200).json({ success: true, data: salary });
    } catch (error) {
      return res.status(500).json({ succcess: false, message: error.message });
    }
  }
  async create(req, res) {
    try {
      let payload = {
        ...req.body,
        userId: req.body.userId,
      };
      let attendance_get = await attendance.find({
        userId: req.body.userId,
      });
      console.log(attendance_get.workingHours);
      // const timeCal = () => {
      //   var cd = 24 * 60 * 60 * 1000,
      //     ch = 60 * 60 * 1000,
      //     d = Math.floor(attendance_get.workingHours / cd),
      //     h = Math.floor((attendance_get.workingHours - d * cd) / ch),
      //     m = Math.round(
      //       (attendance_get.workingHours - d * cd - h * ch) / 60000
      //     ),
      //     pad = function (n) {
      //       return n < 10 ? "0" + n : n;
      //     };
      //   if (m === 60) {
      //     h++;
      //     m = 0;
      //   }
      //   if (h === 24) {
      //     d++;
      //     h = 0;
      //   }
      //   return [d, pad(h), pad(m)].join(":");
      // };

      // console.log(timeCal(3 * 24 * 60 * 60 * 1000));
      // if (attendance_get.length > 0) {
      //   console.log(attendance_get.length);
      // }else{
      //   console.log("Entry Not Found");
      // }
      // console.log(attendance_get);
      let a = {
        attendanceId: req.body.attendanceId,
      };

      let salary = new SalarySchema(payload);
      // await salary.save();
      return res.status(200).json({ success: true, data: salary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async show(req, res) {
    try {
      let salary = await SalarySchema.findById(req.params.id)
        .populate("userId")
        .populate("attendanceId");

      return res.status(200).json({ success: true, data: salary });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async delete(req, res) {
    try {
      await SalarySchema.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: true }
      );
      return res.status(200).json({ success: true, data: [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
module.exports = new SalaryController();
