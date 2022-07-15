const { RoleSchema } = require("../../../models/admin/role.js");
const { CONSTANTS } = require("../../../constants/index.js");
const {
  findAllQuery,
  deleteOneQuery,
  updateOneQuery,
  findbyIdRole,
} = require("../../../services/admin/roleServices.js");
const { isValidObjectId } = require("mongoose");
const { userQuery } = require("../../../services/admin/userServices.js");
const { findAll } = require("../../../services/admin/permissionService.js");

const {
  RESPONSE_MESSAGE: { ROLE, FAILEDRESPONSE, INVALIDOBJECTID },
  STATUS_CODE: { SUCCESS, FAILED },
} = CONSTANTS;
const createRole = async (req, res) => {
  try {
    
    const insertObj = {
      ...req.body,
      createdBy: req.currentUser._id
    };
    const findPermissions = await findAll({
      permission: req.body.permission,
    });
    if (findPermissions === false) {
      throw new Error("some permission is not avalible");
    }
    const saveRole = new RoleSchema(insertObj);
    const saveResponse = await saveRole.save();
    if (saveResponse) {
      return res
        .status(200)
        .json({ success: true, msg: "Role Created", data: saveResponse });
    } else {
      throw new Error(ROLE.CREATEFAILED);
    }
  } catch (error) {
    res.status(FAILED).json({
      success: false,
      error: error.message || FAILEDRESPONSE,
    });
  }
};
const getRole = async (req, res) => {
  try {
    const { data } = await findAllQuery(req.query);
    if (data) {
      res.status(200).json({
        success: true,
        msg: "Role",
        data: data,
      });
    } else {
      throw new Error(ROLE.GETFAILED);
    }
  } catch (error) {
    res.status(FAILED).json({
      success: false,
      error: error.message || FAILEDRESPONSE,
    });
  }
};
const getRoleById = async (req, res) => {
  try {
    const data  = await findbyIdRole({_id: req.params.id});
    if (data) {
      res.status(200).json({
        success: true,
        msg: "Role",
        data: data,
      });
    } else {
      throw new Error(ROLE.GETFAILED);
    }
  } catch (error) {
    res.status(FAILED).json({
      success: false,
      error: error.message || FAILEDRESPONSE,
    });
  }
};
const updateRole = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    if (!isValidObjectId(id)) {
      throw new Error(INVALIDOBJECTID);
    }
    const findPermissions = await findAll({
      permission: req.body.permission,
    });
    if (findPermissions === false) {
      throw new Error("some permission is not avalible");
    }

    let filter = { _id: id };
    const { data } = await findAllQuery(filter);
    if (data.length === 1) {
      let update = { ...req.body };
      const data = await updateOneQuery(filter, update);
      if (data) {
        res.status(200).send({
          success: true,
          msg: "Role Updated",
          data: data,
        });
      } else {
        throw new Error();
      }
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
const deleteRole = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    if (!isValidObjectId(id)) {
      throw new Error(INVALIDOBJECTID);
    }
    const checkExistingUser = await userQuery({
      role: id,
    });
    if (checkExistingUser) {
      throw new Error(ROLE.USERAVAILABLE);
    }
    const data = await deleteOneQuery(id);
    if (data) {
      res.status(200).send({
        success: true,
        msg: "Role Deleted",
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
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRoleById,
};
