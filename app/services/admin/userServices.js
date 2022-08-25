const { UserSchema } = require("../../models/user");

const userQuery = async (filter, projection) => {
  let query = { name: filter.name, email: filter.email };
  filter = filter && filter.orQuery ? query : filter;
  let isPopulate = filter.populate,
    data;
  delete filter.populate;
  if (isPopulate) {
    data = await UserSchema.findOne(filter, projection).populate({
      path: "role_type",
      populate: {
        path: "permissions",
        select: "displayName",
      },
    });
  } else {
    data = await UserSchema.findOne(filter, projection);
  }
  return data;
};

module.exports = {
  userQuery,
};
