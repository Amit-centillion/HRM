const { TimeSheetSchema } = require("../../../models/task.model");
const moment = require("moment");
const { Types } = require("mongoose");
class TaskController {
    async addTask(req, res) {
        try {
            let { body, currentUser } = req
            body = {
                ...body,
                userId: currentUser._id,
                createdAt: body?.workDate
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
            let whereClues = {};
            if (query.userId) {
                whereClues.userId = query.userId
            }
            if (currentUser?.employeeType === 'FULLTIME') {
                whereClues = { userId: currentUser._id }
            }
            if (currentUser?.employeeType != 'FULLTIME') {
                if (!query.startDate && !query.endDate) {
                    const today = moment().startOf('day')
                    whereClues["createdAt"] = {
                        $gte: today.toDate(),
                        $lte: moment(today).endOf('day').toDate()
                    };
                }
            }

            if (query.startDate && query.endDate) {
                let startDate = moment(query.startDate).startOf("day").toISOString();
                let endDate = moment(query.endDate).endOf("day").toISOString();
                whereClues["createdAt"] = {
                    $gte: startDate,
                    $lte: endDate
                };

            }

            if (query.projectId) {
                whereClues = { ...whereClues, projectId: query.projectId }
            }
            const options = {
                page: query.page || 1,
                limit: query.limit || 10,
                sort: { createdAt: -1 },
                populate: "userId projects.ProjectId",
            };
            console.log('whereClues', whereClues)
            let resultList =
                req.query.page || req.query.limit
                    ? await TimeSheetSchema.paginate(whereClues, options)
                    : await TimeSheetSchema.find(whereClues)
                        .sort({
                            createdAt: -1,
                        })
                        .populate({
                            path: "userId",
                            select: ["email", "firstname", "lastname", "profile", "profile", "designation", "email"],
                        });
            // const result = await TimeSheetSchema.find(whereClues).populate({ path: "projects.ProjectId" }).populate("userId").sort({ createdAt: -1 })
            return res.status(200).json({ success: true, data: resultList })
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error })
        }
    }

}
module.exports = new TaskController();