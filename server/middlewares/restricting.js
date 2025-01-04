import { ApiError } from "../utils/apiError.js";
export const restrictTo =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req.user;

    if (!user) return next(new ApiError("User not found", 404));

    if (!roles.includes(user.role)) {
      return next(
        new ApiError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
