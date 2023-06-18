const express = require('express');
const giangVienController = require('../controller/giangVienController');

const auth = require("../middleware/auth");

let Router = express.Router()

Router.get('/getallgiangvien',auth.verifyTokenQuanLi,giangVienController.getAllGiangVien)
Router.post('/themgiangvien', auth.verifyTokenQuanLi,giangVienController.themGiangVien);


module.exports = Router 