const { TimeSheetSchema } = require("../../../models/task.model");
const moment = require("moment");
class TaskController {
    async addTask(req, res) {
        try {
            let { body, currentUser } = req
            body = {
                ...body,
                userId: currentUser._id
            }
            const payload = new TimeSheetSchema(body)
            const result = await payload.save()
            return res.status(200).json({ success: true, data: result })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error })
        }
    }
    async deleteTask(req, res) {
        try {
            const { id } = req.params
            const result = await TimeSheetSchema.findByIdAndDelete(id)
            return res.status(200).json({ success: true, data: result })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error })
        }
    }
    async getTask(req, res) {
        try {
            const { currentUser, query } = req
            let whereCluse = { userId: currentUser._id }
            if (query.startDate) {
                let createdAt = moment(query.startDate).startOf("day").toISOString();
                whereCluse = { ...whereCluse, createdAt: { $gt: createdAt } }
            }
            if (query.endDate) {
                let createdAt = moment(query.endDate).endOf("day").toISOString();
                whereCluse = { ...whereCluse, createdAt: { $lt: createdAt } }
            }
            if (query.id) {
                whereCluse = { ...whereCluse, _id: query.id }
            }
            if (query.projectId) {
                whereCluse = { ...whereCluse, projectId: query.projectId }
            }
            const result = await TimeSheetSchema.find({ whereCluse }).populate({ path: "projects.ProjectId" }).populate("userId").sort({ createdAt: -1 })
            return res.status(200).json({ success: true, data: result })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error })
        }
    }

}
module.exports = new TaskController();