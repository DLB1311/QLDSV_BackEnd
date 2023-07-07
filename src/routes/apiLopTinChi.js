const express = require('express');
const lopTinChiController = require('../controller/lopTinChiController');


const auth = require("../middleware/auth");

let router = express.Router();

router.get('/getallloptinchi',auth.verifyTokenQuanLi, lopTinChiController.getAllLopTinChi);
router.get('/getloptinchi/:MaLTC',auth.verifyTokenQuanLi, lopTinChiController.layLopTinChi);
router.post('/themloptinchi', auth.verifyTokenQuanLi, lopTinChiController.themLopTinChi);
router.put('/sualoptinchi/:MaLTC', auth.verifyTokenQuanLi, lopTinChiController.suaLopTinChi);
router.delete('/xoaloptinchi/:MaLTC', auth.verifyTokenQuanLi, lopTinChiController.xoaLopTinChi);

router.get('/hienThiDanhSachLichHoc',auth.verifyTokenQuanLi, lopTinChiController.getAllLopTinChi);


router.get('/hienThiLichHocChuaCoTrongLopTinChi/:MaLTC',auth.verifyTokenQuanLi, lopTinChiController.hienThiLichHocChuaCoTrongLopTinChi);
router.get('/hienThiPhongHocChuaCoTrongLopTinChi/:MaLTC',auth.verifyTokenQuanLi, lopTinChiController.hienThiPhongHocChuaCoTrongLopTinChi);
router.get('/hienThiLichHocVaPhongHocCuaLopTinChi/:MaLTC',auth.verifyTokenQuanLi, lopTinChiController.hienThiLichHocVaPhongHocCuaLopTinChi);
router.post('/themLichHoc', auth.verifyTokenQuanLi, lopTinChiController.themLichHoc);
router.post('/xoaLichHocVaPhongHoc', auth.verifyTokenQuanLi, lopTinChiController.xoaLichHocVaPhongHoc);



// router.post('/xoaloptinchi/:MaLTC', auth.verifyTokenQuanLi, lopTinChiController.xoaLopTinChi);

module.exports = router;
