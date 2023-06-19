const express = require('express');
const monHocController = require('../controller/monHocController');

const auth = require("../middleware/auth");

let Router = express.Router()

Router.get('/getallmonhoc', auth.verifyTokenQuanLi , monHocController.getAllMonHoc);
Router.post('/layMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.layMonHoc);
Router.post('/themmonhoc', auth.verifyTokenQuanLi , monHocController.themMonHoc);
Router.put('/suaMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.suaMonHoc);
Router.put('/xoaMonHoc/:MaMH', auth.verifyTokenQuanLi , monHocController.xoaMonHoc);


module.exports = Router 