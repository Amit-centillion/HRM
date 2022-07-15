const { PermissionSchema } = require("../../models/admin/permission.js");

const findAll = async (query) => {
  let { search, _id, limit, page, sortField, sortValue } = query;
  let sort = {};
  let whereClause = {};
  if (sortField) {
    sort = {
      [sortField]: sortValue === "ASC" ? 1 : -1,
    };
  } else {
    sort = {
      displayName: 1,
    };
  }
  if (search) {
    search = new RegExp(search, "ig");
    whereClause = {
      $or: [{ displayName: search }, { path: search }],
    };
  }
  if (_id) {
    whereClause = { ...whereClause, _id };
  }
  const data = await PermissionSchema.find(whereClause)
    .skip(page > 0 ? +limit * (+page - 1) : 0)
    .limit(+limit || 20)
    .sort(sort);
  const totalCount = await PermissionSchema.find(whereClause).countDocuments();
  return { data, totalCount };
};
const findByIdQuery = async (filter) => {
  const data = await PermissionSchema.find({
    _id: { $in: filter.permission },
  });
  if (filter.length === data.length) return true;
  else return false;
};
const updateOneQuery = async (filter, update, projection) => {
  let options = { new: true, fields: { ...projection } };

  const data = await PermissionSchema.findOneAndUpdate(filter, update, options);
  return data;
};
const deleteOneQuery = async (filter) => {
  const data = await PermissionSchema.findByIdAndDelete(filter);
  return data;
};

module.exports = {
  findAll,
  findByIdQuery,
  updateOneQuery,
  deleteOneQuery,
};
