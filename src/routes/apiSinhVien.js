const express = require('express');
const sinhVienController = require('../controller/sinhVienController');

const auth = require("../middleware/auth");

let Router = express.Router()


Router.get('/getallsinhvien', auth.verifyTokenQuanLi , sinhVienController.getAllSinhVien);
Router.get('/hienSinhVien/:MaSV', auth.verifyTokenQuanLi , sinhVienController.hienSinhVien);
Router.post('/themsinhvien', auth.verifyTokenQuanLi ,sinhVienController.themSinhVien);
Router.put('/suasinhvien/:MaSV', auth.verifyTokenQuanLi ,sinhVienController.suaSinhVien);
Router.delete('/xoaSinhVien/:MaSV', auth.verifyTokenQuanLi ,sinhVienController.xoaSinhVien);
Router.put('/choSinhVienNghi/:MaSV', auth.verifyTokenQuanLi ,sinhVienController.choSinhVienNghi);

Router.get('/hienThiDiemTheoHocKi', sinhVienController.hienThiDiemTheoHocKi);

Router.get('/hienThiLopChuaCoDiemVaChuaDenThoiGianBatDau', sinhVienController.hienThiLopChuaCoDiemVaChuaDenThoiGianBatDau);
Router.post('/dieuChinhDangKiMonHoc', auth.verifyToken ,sinhVienController.dieuChinhDangKiMonHoc);
Router.post('/hienThiLTCsDaDangKi/:MaSV', auth.verifyToken ,sinhVienController.hienThiLTCsDaDangKi);
Router.post('/dangKiLopTinChi', auth.verifyToken ,sinhVienController.dangKiLopTinChi);
Router.post('/dangKi1LopTinChi', auth.verifyToken ,sinhVienController.dangKi1LopTinChi);

Router.post('/huyDangKiLopTinChi', auth.verifyToken ,sinhVienController.huyDangKiLopTinChi);
Router.post('/huyDangKi1LopTinChi', auth.verifyToken ,sinhVienController.huyDangKi1LopTinChi);

module.exports = Router 