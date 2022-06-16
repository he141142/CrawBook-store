
module.exports = class CoreService {

  prepareSetRole = (req) => {
    const userId = req.query.userId;
    const roleId = req.query.roleId;
    return {
      userId: userId,
      roleId: roleId,
    };
  };
}

