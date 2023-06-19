
const routerSinhVien = require('./apiSinhVien')
const routerTaiKhoan = require('./apiTaikhoan')
const routerGiangVien = require('./apiGiangVien')
const routerMonHoc= require('./apiMonHoc')
const routerLopTinChi= require('./apiLopTinChi')


function initAPIRoute(app) {

    app.use('/api/v1/sinhvien', routerSinhVien);

    app.use('/api/v1/taikhoan', routerTaiKhoan);
 
    app.use('/api/v1/giangvien', routerGiangVien);

    app.use('/api/v1/monhoc', routerMonHoc);

    app.use('/api/v1/loptinchi', routerLopTinChi);




    // app.use('/api/v1/order', routerOrder)
}


module.exports = initAPIRoute;