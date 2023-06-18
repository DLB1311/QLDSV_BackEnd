const Database  = require("../config/database");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = Database.getInstance();
pool.connect();
    
let getAllSinhVien = async (req, res) => {

  try {
    const query = 'SELECT * FROM dbo.SinhVien';
    const result = await pool.executeQuery(query);
    res.status(200).json(result);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
let hienSinhVien = async (req, res) => {
  const { MaSV } = req.params;

  try {
    const query = `SELECT * FROM dbo.SinhVien WHERE MaSV = '${MaSV}'`;
    const result = await pool.executeQuery(query);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    const sinhVien = result[0];

    res.status(200).json({ success: true, sinhVien });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
let themSinhVien = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      // Xảy ra lỗi khi upload file
      return res.status(500).json({ success: false, message: "Lỗi upload file" });
    }

    const { HoTen, Phai, NgaySinh, DiaChi, KhoaHoc, TrangThaiNghi, MaLop } = req.body;

    try {
      // Lấy mã sinh viên lớn nhất hiện tại từ bảng SinhVien để xác định mã tiếp theo
      const getMaxMaSVQuery = "SELECT MAX(CAST(SUBSTRING(MaSV, 3, LEN(MaSV)) AS INT)) AS MaxMaSV FROM dbo.SinhVien";
      const maxMaSVResult = await pool.executeQuery(getMaxMaSVQuery);
      const maxMaSV = maxMaSVResult.length > 0 ? maxMaSVResult[0].MaxMaSV : 0; // Lấy giá trị mã sinh viên cuối cùng

      // Tạo mã sinh viên mới
      const nextMaSVNumber = maxMaSV + 1;
      const nextMaSV = 'SV' + nextMaSVNumber.toString().padStart(1, '0'); // Tạo mã sinh viên tăng dần

      const query = `
        INSERT INTO dbo.SinhVien (MaSV, HoTen, Phai, NgaySinh, DiaChi, KhoaHoc, TrangThaiNghi, MaLop, HinhAnh)
        VALUES ('${nextMaSV}', '${HoTen}', ${Phai}, '${NgaySinh}', '${DiaChi}', '${KhoaHoc}', ${TrangThaiNghi}, '${MaLop}', '${req.file.filename}')
      `;
      await pool.executeQuery(query);

      // Tạo tài khoản cho sinh viên với mật khẩu đã được băm (bcrypt)
      const hashedPassword = await bcrypt.hash('123456789', 10); // Băm mật khẩu '12345678' với bcrypt

      const insertTaiKhoanQuery = `INSERT INTO dbo.TaiKhoan (MaTk, TenTaiKhoan, MatKhau, MaVaitro)
      VALUES ('${nextMaSV}', '${nextMaSV}', '${hashedPassword}', 'SV')`;

      await pool.executeQuery(insertTaiKhoanQuery);

      const sinhVien = {
        MaSV: nextMaSV,
        HoTen,
        Phai,
        NgaySinh,
        DiaChi,
        KhoaHoc,
        TrangThaiNghi,
        MaLop,
        HinhAnh: req.file.filename,
      };

      res.status(201).json({
        success: true,
        message: "Thêm sinh viên thành công",
        sinhVien,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};
let suaSinhVien = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      // Xảy ra lỗi khi upload file
      return res.status(500).json({ success: false, message: "Lỗi upload file" });
    }

    const { HoTen, Phai, NgaySinh, DiaChi, KhoaHoc, TrangThaiNghi, MaLop } = req.body;
    const { MaSV } = req.params;

    try {
      const query = `
        UPDATE dbo.SinhVien
        SET HoTen = '${HoTen}',
            Phai = ${Phai},
            NgaySinh = '${NgaySinh}',
            DiaChi = '${DiaChi}',
            KhoaHoc = '${KhoaHoc}',
            TrangThaiNghi = ${TrangThaiNghi},
            MaLop = '${MaLop}',
            HinhAnh = '${req.file.filename}'
        WHERE MaSV = '${MaSV}'
      `;

      await pool.executeQuery(query);

      const sinhVien = {
        MaSV,
        HoTen,
        Phai,
        NgaySinh,
        DiaChi,
        KhoaHoc,
        TrangThaiNghi,
        MaLop,
        HinhAnh: req.file.filename,
      };

      res.status(200).json({
        success: true,
        message: "Cập nhật sinh viên thành công",
        sinhVien,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
};
let xoaSinhVien = async (req, res) => {
  const { MaSV } = req.params;

  try {
    const deleteSinhVienQuery = `
      DELETE FROM dbo.SinhVien
      WHERE MaSV = '${MaSV}'
    `;

    await pool.executeQuery(deleteSinhVienQuery);

    const deleteTaiKhoanQuery = `
      DELETE FROM dbo.TaiKhoan
      WHERE MaTk = '${MaSV}'
    `;

    await pool.executeQuery(deleteTaiKhoanQuery);

    res.status(200).json({ success: true, message: "Xóa sinh viên thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

let choSinhVienNghi = async (req, res) => {
  const { MaSV } = req.params;

  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM dbo.SinhVien WHERE MaSV = '${MaSV}'`;
    const checkSinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (checkSinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Cập nhật trạng thái nghỉ cho sinh viên
    const updateSinhVienQuery = `UPDATE dbo.SinhVien SET TrangThaiNghi = 1 WHERE MaSV = '${MaSV}'`;
    await pool.executeQuery(updateSinhVienQuery);

    // Cập nhật trạng thái Active = false trong bảng TaiKhoan
    const updateTaiKhoanQuery = `UPDATE dbo.TaiKhoan SET Active = 0 WHERE MaTk = '${MaSV}'`;
    await pool.executeQuery(updateTaiKhoanQuery);

    res.status(200).json({ success: true, message: 'Cho sinh viên nghỉ thành công', MaSV });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = {
  getAllSinhVien,
  hienSinhVien,
  themSinhVien,
  suaSinhVien,
  xoaSinhVien,
  choSinhVienNghi,
};