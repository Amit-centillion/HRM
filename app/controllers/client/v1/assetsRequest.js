const assets = require("../../../models/assetsRequest");

const assetsRequestprocess = async (req, res) => {
    try {
        if (req.body) {
            let data = { userId: req.currentUser?._id, ...req.body }
            const Model = new assets(data);
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

const removeId = (id) => {
    const res = assets.deleteOne(
        { _id: id },
    );
    return res;
};
const updateOnebyid = (id, data) => {
    const res = assets.findByIdAndUpdate({ _id: id }, { ...data }, { new: true });
    return res;
};

const updateByid = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('id', id)

        const response = updateOnebyid(id, req.body);
        console.log('response', response)
        response
            .then((data) => {
                console.log('data', data)
                res.status(200).json({
                    success: true,
                    data: data,
                    message: 'update successfuly',
                });
                console.log('data', data)
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
const deleteByID = async (req, res) => {
    try {
        const { id } = req.params;
        const response = removeId(id);
        response.then((data) => {
            res.status(200).json({
                success: true,
                message: 'delete data successfuly',
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
const getRequest = async (req, res) => {
    try {
        const { userId } = req.query;
        var response;
        if (userId) {
            response = await assets.find({ userId: userId });
        } else {
            response = await assets.find();
        }
        if (response) {
            res.status(200).json({
                success: true,
                data: response,
                message: response ? 'user found' : 'user not found',
            });
        } else {
            throw new Error("user not found!")
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message || 'failed',
        });
    }
};
const statusRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const responseData = await assets.findById(id)
        console.log('responseData', responseData)
        let respose;
        if (responseData) {
            if (responseData?.status === "SENT") {
                respose = await assets.findOneAndUpdate({ _id: id }, {
                    $set: {
                        status: "PANDING",
                        userId: req.currentUser?._id, ...req.body
                    }
                }, { new: true })
            } else if (responseData?.status === "PANDING") {
                respose = await assets.findOneAndUpdate({ _id: id }, {
                    $set: {
                        status: "APPROVED"
                    }
                }, { new: true })
            }
            console.log('respose', respose)
            return res.status(200).json({
                status: true, message: "", respose
            });
        }
        else {
            throw new Error("Leave request failed");
        }
    } catch (error) {

        res.status(400).json({
            success: false,
            error: error.message || 'failed',
        });
    }
};

module.exports = {
    assetsRequestprocess,
    getRequest,
    deleteByID,
    updateByid,
    statusRequest
};
