const express = require("express");
const router = express.Router();
const auth = require("../controller/auth");
const { check, body } = require("express-validator");
const Staff = require("../models/staff");

router.get("/", auth.getLogin);
router.post(
  "/",
  [
    body("email").isEmail().withMessage("Địa chỉ Email không đúng"),
    body("password", "Mật khẩu không đúng")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  auth.postLogin
);

router.get("/register", auth.getRegister);
router.post(
  "/register",
  [
    check("email")
      .isEmail()
      .withMessage("Email không hợp lệ.")
      .custom((value, { req }) => {
        return Staff.findOne({ email: value }).then((staffDoc) => {
          if (staffDoc) {
            return Promise.reject(
              "Email đã tồn tại. Vui lòng chọn Email khác."
            );
          }
        });
      })
      .normalizeEmail(),
    body("password", "Mật khẩu phải là số hoặc chữ và có ít nhất 5 kí tự.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("name", "Họ tên phải có tối thiểu 3 ký tự.")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    check("doB", "Ngày sinh không được để trống.").not().isEmpty(),
    check("salaryScale", "Hệ số lương không được để trống.")
      .not()
      .isEmpty()
      .isAlphanumeric(),
    check("startDate", "Ngày vào công ty không được để trống.").not().isEmpty(),
    check("department", "Phòng ban không được để trống.").not().isEmpty(),
    check("managerEmail", "Email quản lý không được để trống.").not().isEmpty(),
  ],
  auth.postRegister
);

module.exports = router;
