const { projectSchema } = require("../../../models/project");

class projectController {
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
    criteria = { ...criteria, isDeleted: false };

    let project =
      req.query.page || req.query.limit
        ? await projectSchema.paginate(criteria, options)
        : await projectSchema
          .find(criteria)
          .sort({ [sort_key]: sort_direction })
          .populate({ path: "employeeId", select: ["firstname", "lastname", "email", "profile"] })

    return res.status(200).json({ success: true, data: project });
  }
  async create(req, res) {
    try {
      let payload = {
        ...req.body,
      };
      let project = new projectSchema(payload);
      await project.save();
      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async show(req, res) {
    try {
      let criteria = {
        isDeleted: false,
      };
      let project = await projectSchema.findById(req.params.id, criteria);
      console.log('project', project)
      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async update(req, res) {
    try {
      let project = await projectSchema.findById(req.params.id);
      let payload = {
        ...req.body,
      };
      let updateProject = await projectSchema.findByIdAndUpdate(
        project,
        payload,
        { upsert: true, new: true }
      );
      return res.status(200).json({ success: true, data: updateProject });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async delete(req, res) {
    try {
      await projectSchema.findOneAndUpdate(
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

module.exports = new projectController();
