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

let hienGiangVien = async (req, res) => {
  const { MaGV } = req.params;

  try {
    const query = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${MaGV}'`;
    const result = await pool.executeQuery(query);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    const giangVien = result[0];

    res.status(200).json({ success: true, giangVien });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let themGiangVien = async (req, res) => {
  const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi } = req.body;

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
    const insertGiangVienQuery = `INSERT INTO dbo.GiangVien (MaGV, HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi)
    VALUES ('${nextMaGV}', N'${HoTen}', N'${HocVi}', N'${HocHam}', ${Phai}, '${NgaySinh}', N'${DiaChi}')`;

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

let suaGiangVien = async (req, res) => {
  const { HoTen, HocVi, HocHam, Phai, NgaySinh, DiaChi} = req.body;
  const { Magv } = req.params;  
  try {
    // Kiểm tra xem giảng viên có tồn tại hay không
    const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
    const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

    if (checkGiangVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    // Cập nhật thông tin giảng viên
    const updateGiangVienQuery = `UPDATE dbo.GiangVien SET HoTen = N'${HoTen}', HocVi = N'${HocVi}', HocHam = N'${HocHam}', Phai = ${Phai}, NgaySinh = '${NgaySinh}', DiaChi = N'${DiaChi}' WHERE MaGV = '${Magv}'`;

    await pool.executeQuery(updateGiangVienQuery);

    res.status(200).json({ success: true, message: 'Cập nhật giảng viên thành công', MaGV: Magv });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let xoaGiangVien = async (req, res) => {
  const { Magv } = req.params;

  try {
    // Kiểm tra xem giảng viên có tồn tại hay không
    const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
    const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

    if (checkGiangVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    // Xóa giảng viên
    const deleteGiangVienQuery = `DELETE FROM dbo.GiangVien WHERE MaGV = '${Magv}'`;
    await pool.executeQuery(deleteGiangVienQuery);

    // Xóa tài khoản của giảng viên
    const deleteTaiKhoanQuery = `DELETE FROM dbo.TaiKhoan WHERE MaTk = '${Magv}'`;
    await pool.executeQuery(deleteTaiKhoanQuery);

    res.status(200).json({ success: true, message: 'Xóa giảng viên và tài khoản thành công', MaGV: Magv });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let choGiangVienNghi = async (req, res) => {
  const { MaGV } = req.params;

  try {
    // Kiểm tra xem giảng viên có tồn tại hay không
    const checkGiangVienQuery = `SELECT * FROM dbo.GiangVien WHERE MaGV = '${MaGV}'`;
    const checkGiangVienResult = await pool.executeQuery(checkGiangVienQuery);

    if (checkGiangVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    // Kiểm tra xem giảng viên đang dạy một lớp tín chỉ còn hoạt động hay không
    const checkDangDayQuery = `
      SELECT *
      FROM dbo.PhanCong pc
      INNER JOIN dbo.LopTinChi ltc ON pc.MaLTC = ltc.MaLTC
      WHERE pc.MaGV = '${MaGV}' AND ltc.Active = 1
    `;
    const checkDangDayResult = await pool.executeQuery(checkDangDayQuery);

    if (checkDangDayResult.length > 0) {
      return res.status(400).json({ error: 'Giảng viên đang dạy một lớp tín chỉ còn hoạt động' });
    }

    // Cập nhật trạng thái nghỉ cho giảng viên
    const updateGiangVienQuery = `UPDATE dbo.GiangVien SET Active = 0 WHERE MaGV = '${MaGV}'`;
    await pool.executeQuery(updateGiangVienQuery);

    // Cập nhật trạng thái Active = false trong bảng TaiKhoan
    const updateTaiKhoanQuery = `UPDATE dbo.TaiKhoan SET Active = 0 WHERE MaTk = '${MaGV}'`;
    await pool.executeQuery(updateTaiKhoanQuery);

    res.status(200).json({ success: true, message: 'Cho giảng viên nghỉ thành công', MaGV });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let dieuChinhBuoiCoTheDay = async (req, res) => {
  const { MaGV, MaTGBs } = req.body;

  try {
    // Kiểm tra xem giảng viên có tồn tại hay không
    const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
    const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

    if (giangVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    // Lấy danh sách các buổi giảng viên có thể dạy hiện tại
    const getBuoiCoTheDayQuery = `SELECT MaTGB FROM BuoiCoTheDay WHERE MaGV = '${MaGV}'`;
    const buoiCoTheDayResult = await pool.executeQuery(getBuoiCoTheDayQuery);
    const existingBuoiCoTheDay = buoiCoTheDayResult.map((buoi) => buoi.MaTGB);

    // Tìm các buổi cần thêm và xóa
    const buoiThem = MaTGBs.filter((maTGB) => !existingBuoiCoTheDay.includes(maTGB));
    const buoiXoa = existingBuoiCoTheDay.filter((maTGB) => !MaTGBs.includes(maTGB));

    

    // Thêm các buổi mới vào bảng BuoiCoTheDay
    if (buoiThem.length > 0) {
      const insertBuoiCoTheDayQuery = `INSERT INTO BuoiCoTheDay (MaGV, MaTGB) VALUES `;
      const values = buoiThem.map((maTGB) => `('${MaGV}', ${maTGB})`).join(', ');
      await pool.executeQuery(insertBuoiCoTheDayQuery + values);
    }

    // Xóa các buổi không còn trong danh sách MaTGBs
    if (buoiXoa.length > 0) {
      const deleteBuoiCoTheDayQuery = `DELETE FROM BuoiCoTheDay WHERE MaGV = '${MaGV}' AND MaTGB IN (${buoiXoa.join(', ')})`;
      await pool.executeQuery(deleteBuoiCoTheDayQuery);
    }

    res.status(200).json({ success: true, message: 'Điều chỉnh buổi có thể dạy thành công' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let hienThiBuoiCoTheDay = async (req, res) => {
  const { MaGV } = req.params;

  try {
    // Kiểm tra xem giảng viên có tồn tại hay không
    const checkGiangVienQuery = `SELECT * FROM GiangVien WHERE MaGV = '${MaGV}'`;
    const giangVienResult = await pool.executeQuery(checkGiangVienQuery);

    if (giangVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy giảng viên' });
    }

    // Lấy danh sách các buổi giảng viên có thể dạy
    const getBuoiCoTheDayQuery = `SELECT MaTGB FROM BuoiCoTheDay WHERE MaGV = '${MaGV}'`;
    const buoiCoTheDayResult = await pool.executeQuery(getBuoiCoTheDayQuery);
    const buoiCoTheDayList = buoiCoTheDayResult.map((buoi) => buoi.MaTGB);

    res.status(200).json({ success: true, buoiCoTheDay: buoiCoTheDayList });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllGiangVien,
  hienGiangVien,
  themGiangVien,
  suaGiangVien,
  xoaGiangVien,
  choGiangVienNghi,
  dieuChinhBuoiCoTheDay,
  hienThiBuoiCoTheDay
};