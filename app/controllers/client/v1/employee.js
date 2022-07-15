const employeeSchema = require("../../../models/employee");

class employeeController {
  async index(req, res) {
    let sort_key = req.query.sort_key || "name";
    let sort_direction = req.query.sort_direction
      ? req.query.sort_direction === "asc"
        ? 1
        : -1
      : 1;

    let criteria = {};

    if (req.query.type) {
      Object.assign(criteria, { type: req.query.type });
    }

    const options = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      sort: { [sort_key]: sort_direction },
    };

    let employee =
      req.query.page || req.query.limit
        ? await employeeSchema.paginate(criteria, options)
        : await employeeSchema
            .find(criteria)
            .sort({ [sort_key]: sort_direction });

    return res.status(200).json({ success: true, data: employee });
  }
  async create(req, res) {
    try {
      let payload = {
        userId: req.body.userId,
        projectId: req.body.projectId,
      };
      let employee = new employeeSchema(payload);
      await employee.save();
      return res.status(200).json({ success: true, data: employee });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async show(req, res) {
    try {
      let employee = await employeeSchema
        .findById(req.params.id)
        .populate({ path: "userId" })
        .populate({ path: "projectId", select: "projectName" });
      return res.status(200).json({ success: true, data: employee });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async update(req, res) {
    try {
      let employee = await employeeSchema.findOne({
        projectId: req.body.projectId,
      });
      if (employee) {
        console.log("Id is Already there");
        return res.status(500).json({
          success: false,
          message: "Already Project is assign to employee",
        });
      } else {
        let payload = {
          projectId: req.body.projectId,
        };
        let employeeUpdate = await employeeSchema.findOneAndUpdate(
          { _id: req.params.id },
          { $push: payload },
          {
            new: true,
          }
        );
        return res.status(200).json({ success: true, data: employeeUpdate });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async delete(req, res) {
    try {
      await employeeSchema.findOneAndUpdate(
        { _id: req.params.id },
        { isDeleted: true },
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
module.exports = new employeeController();
