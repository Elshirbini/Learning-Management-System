import { ApiError } from "../utils/apiError.js";
export const restrictTo =
  (...roles) =>
  async (req, res, next) => {
    const userRole = req.userRole;

    if (!roles.includes(userRole)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
