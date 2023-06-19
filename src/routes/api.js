
const routerSinhVien = require('./apiSinhVien')
const routerTaiKhoan = require('./apiTaikhoan')
const routerGiangVien = require('./apiGiangVien')
const routerMonHoc = require('./apiMonHoc')

function initAPIRoute(app) {

    app.use('/api/v1/sinhvien', routerSinhVien)

    app.use('/api/v1/taikhoan', routerTaiKhoan)
 
    app.use('/api/v1/giangvien', routerGiangVien)

    app.use('/api/v1/monhoc', routerMonHoc)
}


module.exports = initAPIRoute;