const Database  = require("../config/database");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const pool = Database.getInstance();
pool.connect();
    
let getAllGiangVien = async (req, res) => {

  try {
    const query = 'SELECT * FROM dbo.GiangVien';
    const result = await pool.executeQuery(query);
    res.status(200).json(result);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let themGiangVien = async (req, res) => {
  const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi, ChuyenMon } = req.body;

  try {
    // Lấy MaGV lớn nhất hiện tại từ bảng GiangVien để xác định số tiếp theo
    const getMaxMaGVQuery = "SELECT MAX(CAST(SUBSTRING(MaGV, 3, LEN(MaGV)) AS INT)) AS MaxMaGV FROM dbo.GiangVien";
    const maxMaGVResult = await pool.executeQuery(getMaxMaGVQuery);
    const maxMaGV = maxMaGVResult.length > 0 ? maxMaGVResult[0].MaxMaGV : 0; // Lấy giá trị số lớn nhất

    // Tạo mã giảng viên mới
    let nextMaGV = 'GV1'; // Mã giảng viên khởi tạo ban đầu
    if (maxMaGV) {
      const currentNumber = parseInt(maxMaGV); // Lấy số từ MaGV hiện tại
      const nextNumber = currentNumber + 1;
      nextMaGV = 'GV' + nextNumber.toString().padStart(1, '0'); // Tạo mã giảng viên tăng dần
    }
    // Thêm giảng viên vào bảng GiangVien
    const insertGiangVienQuery = `INSERT INTO dbo.GiangVien (MaGV, HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi, ChuyenMon)
    VALUES ('${nextMaGV}', N'${HoTen}', N'${HocVi}', N'${HocHam}', ${Phai}, '${NgaySinh}', N'${DiaChi}', N'${ChuyenMon}')`;

    await pool.executeQuery(insertGiangVienQuery);

    // Tạo tài khoản cho giảng viên với mật khẩu đã được băm (bcrypt)
    const hashedPassword = await bcrypt.hash('123456789', 10); // Băm mật khẩu '12345678' với bcrypt

    const insertTaiKhoanQuery = `INSERT INTO dbo.TaiKhoan (MaTk, TenTaiKhoan, MatKhau, MaVaitro)
    VALUES ('${nextMaGV}', '${nextMaGV}', '${hashedPassword}', 'GV')`;

    await pool.executeQuery(insertTaiKhoanQuery);

    res.status(200).json({ success: true, message: 'Thêm giảng viên thành công', MaGV: nextMaGV });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  getAllGiangVien,
  themGiangVien,
};