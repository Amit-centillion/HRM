const { isValidObjectId } = require("mongoose");
const { CONSTANTS } = require("../../../constants/index.js");
const { PermissionSchema } = require("../../../models/admin/permission.js");
const {
  findAll,
  deleteOneQuery,
  updateOneQuery,
} = require("../../../services/admin/permissionService.js");
const { roleService } = require("../../../services/index.js");

const {
  RESPONSE_MESSAGE: { PERMISSIONS, FAILEDRESPONSE, INVALIDOBJECTID },
  STATUS_CODE: { SUCCESS, FAILED },
} = CONSTANTS;
const createPermission = async (req, res) => {
  try {
    const insertObj = {
      ...req.body,
    };
    const savePermission = new PermissionSchema(insertObj);
    const saveResponse = await savePermission.save();
    if (saveResponse) {
      const updateRole = await roleService.updatePermission(saveResponse._id, {
        upsert: true,
        new: true,
      });
      if (updateRole) {
        return res
          .status(200)
          .json({ success: true, msg: "Role Updated", data: savePermission });
      } else {
        throw new Error(PERMISSIONS.CREATEFAILED);
      }
    } else {
      throw new Error(PERMISSIONS.CREATEFAILED);
    }
  } catch (error) {
    if (error.code === 11000) {
      error.message = PERMISSIONS.ALREADYAVALIABLE;
    }
    res.status(FAILED).json({
      success: false,
      error: error.message || FAILEDRESPONSE,
    });
  }
};
const getPermission = async (req, res) => {
  try {
    const { data, totalCount } = await findAll(req.query);
    if (data) {
      res.status(200).json({
        success: true,
        msg: "Permission",
        total: totalCount,
        data: data,
      });
    } else {
      throw new Error(PERMISSIONS.GETFAILED);
    }
  } catch (error) {
    res.status(FAILED).json({
      success: false,
      error: error.message || FAILEDRESPONSE,
    });
  }
};
const updatePermission = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    if (!isValidObjectId(id)) {
      res.status(500).json({
        success: false,
        msg: "updated denied",
      });
    }
    let filter = { _id: id };
    const { data } = await findAll(filter);
    if (data.length === 1) {
      let update = { ...req.body };
      const data = await updateOneQuery(filter, update);
      res.status(200).json({
        success: true,
        msg: "Updated permission",
        data,
      });
    } else {
      throw new Error(PERMISSIONS.UPDATEFAILED);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
const deletePermission = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    if (!isValidObjectId(id)) {
      res.status(500).json({
        success: false,
        msg: "Deleted",
      });
    }
    const data = await deleteOneQuery(id);
    if (data) {
      return res.status(200).json({
        success: true,
        msg: "Permission Deleted",
        data: [],
      });
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
module.exports = {
  createPermission,
  getPermission,
  updatePermission,
  deletePermission,
};
