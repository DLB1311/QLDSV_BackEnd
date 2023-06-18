const express = require('express');
const taiKhoanController = require('../controller/taiKhoanController');

const auth = require("../middleware/auth");

let Router = express.Router()


Router.post('/dangnhap', taiKhoanController.dangNhap);
Router.post('/doimatkhau', taiKhoanController.doiMatKhau);



module.exports = Router 