const express = require('express');
const giangVienController = require('../controller/giangVienController');

const auth = require("../middleware/auth");

let Router = express.Router()

Router.get('/getallgiangvien',auth.verifyTokenQuanLi,giangVienController.getAllGiangVien)
Router.get('/hienGiangVien/:Magv',auth.verifyTokenQuanLi,giangVienController.hienGiangVien)
Router.post('/themgiangvien', auth.verifyTokenQuanLi,giangVienController.themGiangVien);
Router.put('/suaGiangVien/:Magv', auth.verifyTokenQuanLi,giangVienController.suaGiangVien);
Router.delete('/xoaGiangVien/:Magv', auth.verifyTokenQuanLi,giangVienController.xoaGiangVien);

Router.put('/choGiangVienNghi/:Magv', auth.verifyTokenQuanLi,giangVienController.choGiangVienNghi);

Router.post('/dieuChinhBuoiCoTheDay', auth.verifyTokenQuanLi,giangVienController.dieuChinhBuoiCoTheDay);

Router.get('/hienThiBuoiCoTheDay/:MaGV', auth.verifyTokenQuanLi,giangVienController.hienThiBuoiCoTheDay);

Router.post('/phanCongGiangVien', auth.verifyTokenQuanLi,giangVienController.phanCongGiangVien);

Router.post('/dieuChinhKhaNangDay', auth.verifyTokenQuanLi,giangVienController.dieuChinhKhaNangDay);

module.exports = Router 