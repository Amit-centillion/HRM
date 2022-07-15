
const assets = require("../../../models/aseetsmanagements");
const assetsService = require("../../../services/assetsService");

const assetsCreate = async (req, res) => {
    console.log('req.body', req.body)
    try {
        if (req.body) {
            const Model = new assets(req.body);
            const saveResponse = await Model.save();
            if (saveResponse) {
                res.status(200).json({
                    success: true,
                    message: 'Assets add ...',
                    data: saveResponse,
                });
            } else {
                throw new Error('Error...');
            }
        } else {
            throw new Error('name is not provided');
        }
    } catch (error) {
        console.log('error', error);
        res.status(400).json({
            success: false,
            error: error.message || 'failed',
        });
    }
};
const assetsUpdate = async (req, res) => {
    try {
        let payload = {
            ...req.body
        }
        console.log('payload', payload);
        const response = assets.findByIdAndUpdate({ _id: req.params.id }, { $set: payload }, {

            new: true
        });
        response.then((data) => {
            return res.status(200).json({ status: true, message: "Assets Update success", data })
        }).catch((error) => {
            throw new Error("update failed", error);
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'failed',
        });
    }
};
const deletebyid = (id) => {
    const res = assets.deleteOne(
        { _id: id },
    );
    return res;
};

const deleteByID = async (req, res) => {
    try {
        const { id } = req.params;
        const response = deletebyid(id);
        console.log('response', response)
        response.then((data) => {
            res.status(200).json({
                success: true,
                message: 'delete user successfuly',
            });
        })
            .catch((error) => {
                throw new Error(error.message);
            });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'failed',
        });
    }
};


module.exports = {
    assetsCreate,
    assetsUpdate,
    deleteByID,
};