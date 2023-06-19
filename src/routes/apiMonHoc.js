const express = require('express');
const monHocController = require('../controller/monHocController');

const auth = require("../middleware/auth");

const Router = express.Router();

Router.get('/getallmonhoc', auth.verifyTokenQuanLi , monHocController.getAllMonHoc);
Router.post('/layMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.layMonHoc);
Router.post('/themmonhoc', auth.verifyTokenQuanLi , monHocController.themMonHoc);
Router.put('/suaMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.suaMonHoc);
Router.put('/xoaMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.xoaMonHoc);


Router.get('/hienThiDanhSachLopTinChi', auth.verifyTokenQuanLi , monHocController.hienThiDanhSachLopTinChi);
Router.put('/chinhSuaLopTinChi', auth.verifyTokenQuanLi , monHocController.chinhSuaLopTinChi);
Router.put('/xoaLopTinChi', auth.verifyTokenQuanLi , monHocController.xoaLopTinChi);

Router.get('/hienThiDanhSachDangKi/:MaLTC', auth.verifyTokenQuanLi , monHocController.hienThiDanhSachDangKi);
Router.put('/chinhSuaDiemSinhVien', auth.verifyTokenQuanLi , monHocController.chinhSuaDiemSinhVien);

Router.post('/dieuChinhLichHoc', auth.verifyTokenQuanLi , monHocController.dieuChinhLichHoc);
Router.get('/hienThiLichHoc', auth.verifyTokenQuanLi, monHocController.hienThiLichHoc);
Router.post('/themLichHoc', auth.verifyTokenQuanLi, monHocController.themLichHoc);
Router.delete('/xoaLichHoc', auth.verifyTokenQuanLi, monHocController.xoaLichHoc);

module.exports = Router;
