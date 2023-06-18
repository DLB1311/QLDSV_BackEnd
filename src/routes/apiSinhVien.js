const express = require('express');
const sinhVienController = require('../controller/sinhVienController');

const auth = require("../middleware/auth");

let Router = express.Router()


Router.get('/getallsinhvien', sinhVienController.getAllSinhVien);

Router.post('/themsinhvien', auth.verifyTokenQuanLi ,sinhVienController.themSinhVien);
Router.put('/suasinhvien/:MaSV', auth.verifyTokenQuanLi ,sinhVienController.suaSinhVien);
Router.delete('/xoaSinhVien/:MaSV', auth.verifyTokenQuanLi ,sinhVienController.xoaSinhVien);



module.exports = Router 