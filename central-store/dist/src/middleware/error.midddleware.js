"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const error_1 = require("../utils/error");
function errorHandler(err, req, res, next) {
    console.error("Error caught:", err);
    if (err instanceof error_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            details: err.details,
        });
    }
    if (err.code?.startsWith("P")) {
        return res.status(500).json({
            success: false,
            message: "Database error",
            code: err.code,
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
//# sourceMappingURL=error.midddleware.js.map