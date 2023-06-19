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

Router.get('/hienThiBangThoiGianBieu', auth.verifyTokenQuanLi,giangVienController.hienThiBangThoiGianBieu);
Router.post('/dieuChinhBuoiCoTheDay', auth.verifyTokenQuanLi,giangVienController.dieuChinhBuoiCoTheDay);
Router.get('/hienThiBuoiCoTheDay/:MaGV', auth.verifyTokenQuanLi, giangVienController.hienThiBuoiCoTheDay);
Router.post('/themBuoiCoTheDay', auth.verifyTokenQuanLi, giangVienController.themBuoiCoTheDay);
Router.post('/xoaBuoiCoTheDay', auth.verifyTokenQuanLi, giangVienController.xoaBuoiCoTheDay);

Router.get('/hienThiBangPhanCongTheoGiangVien/:MaGV', auth.verifyTokenQuanLi,giangVienController.hienThiBangPhanCongTheoGiangVien);
Router.post('/phanCongGiangVien', auth.verifyTokenQuanLi,giangVienController.phanCongGiangVien);
Router.post('/dieuChinhKhaNangDay', auth.verifyTokenQuanLi,giangVienController.dieuChinhKhaNangDay);
Router.get('/hienThiKhaNangDay', auth.verifyTokenQuanLi, giangVienController.hienThiKhaNangDay);
Router.post('/themKhaNangDay', auth.verifyTokenQuanLi, giangVienController.themKhaNangDay);
Router.delete('/xoaKhaNangDay', auth.verifyTokenQuanLi, giangVienController.xoaKhaNangDay);

module.exports = Router 