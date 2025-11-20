"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.get('/:id', user_controller_1.UserController.getUser);
router.post('/sign-in', user_controller_1.UserController.loginUser);
router.post('/sign-up', user_controller_1.UserController.signupUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map