const HolidayModel = require('../../../models/holidayModel');
const moment = require("moment");
const { default: mongoose } = require('mongoose');
const AddHoliday = async (req, res) => {
    const { currentUser } = req

    try {
        let payload = req.body
        let date = new Date(payload.startDate)
        let year = date.getFullYear();
        let startDate = moment(payload.startDate).startOf("day");
        let endDate = moment(payload.endDate).endOf("day");
        let diffDay = Math.round(moment(endDate).diff(startDate, "hours") / 24);


        if (diffDay === 1) {
            payload = {
                ...payload,
                addedBy: currentUser._id,
                year
            }

            let savePayload = new HolidayModel(payload);
            await savePayload.save();
            return res.status(200).json({ status: true, message: "holiday Adding success" })
        }
        else {
            let payloadUpdate = []
            for (let i = 0; i < diffDay; i++) {
                let tempPayload = {
                    ...payload,
                    startDate: moment(startDate).add(i, "days").startOf("day"),
                    endDate: moment(startDate).add(i, "days").endOf("day"),
                    year,
                    addedBy: currentUser._id,
                }
                payloadUpdate.push(tempPayload);
            }
            await HolidayModel.insertMany(payloadUpdate)

            return res.status(200).json({ status: true, message: "holiday Adding success" })
        }



    }
    catch (err) {
        console.log('err', err)
        return res.status(500).send({ message: err.message, status: false });

    }

}
const GetHoliday = async (req, res) => {
    try {
        let todayDate = moment().startOf("day")
        let { _id, incoming } = req.query
        let year = new Date().getFullYear()
        let whereClues = { year }


        if (_id) {
            whereClues = { ...whereClues, _id: mongoose.Types.ObjectId(_id) }
        }
        if (incoming) {
            whereClues = { ...whereClues, startDate: { $gte: new Date(todayDate) } }
        }

        let holidayData = await HolidayModel.find(whereClues);

        return res.status(200).json({ status: true, message: "Holiday Data found", data: holidayData });

    }
    catch (err) {
        return res.status(500).send({ message: err.message, status: false });
    }
}
const UpdateHoliday = async (req, res) => {
    try {
        const { _id } = req.params
        let updatePayload = req.body;
        let updateHoliday = await HolidayModel.findOneAndUpdate({ _id: _id }, { $set: { ...updatePayload } })
        if (updateHoliday) {
            return res.status(200).json({ success: true, message: "update success", data: updatePayload });
        }
        else {
            throw new Error("update failed");
        }

    }
    catch (err) {
        return res.status(500).send({ message: err.message, status: false });
    }
}
const DeleteHoliday = async (req, res) => {
    try {
        const { _id } = req.params;

        let updateHoliday = await HolidayModel.findByIdAndRemove(_id);
        if (updateHoliday) {
            return res.status(200).json({ success: true, message: "delete success" })
        }
        else {
            throw new Error("delete failed");
        }

    }
    catch (err) {
        return res.status(500).send({ message: err.message, status: false });
    }
}


module.exports = {
    AddHoliday,
    GetHoliday,
    UpdateHoliday,
    DeleteHoliday

}