const Database  = require("../config/database");
const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const pool = Database.getInstance();
pool.connect();

let getAllMonHoc = async (req, res) => {
  try {
    const query = "SELECT * FROM dbo.MonHoc";
    const result = await pool.executeQuery(query);

    res.status(200).json({ success: true, monhoc: result });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let layMonHoc = async (req, res) => {
  const { MaMH } = req.params;

  try {
    // Kiểm tra xem môn học có tồn tại hay không
    const checkMonHocQuery = `SELECT * FROM dbo.MonHoc WHERE MaMH = '${MaMH}'`;
    const checkMonHocResult = await pool.executeQuery(checkMonHocQuery);

    if (checkMonHocResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy môn học' });
    }

    const monHoc = checkMonHocResult[0];

    res.status(200).json({ success: true, message: 'Lấy thông tin môn học thành công', monHoc });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let themMonHoc = async (req, res) => {
    const { TenMH, SoTietLT, SoTietTH, SoTinChi, HeSoCC, HeSoGK, HeSoCK } = req.body;
  
    try {
      // Lấy MaMH lớn nhất hiện tại từ bảng MonHoc để xác định số tiếp theo
      const getMaxMaMHQuery = "SELECT MAX(CAST(SUBSTRING(MaMH, 3, LEN(MaMH)) AS INT)) AS MaxMaMH FROM dbo.MonHoc";
      const maxMaMHResult = await pool.executeQuery(getMaxMaMHQuery);
      const maxMaMH = maxMaMHResult.length > 0 ? maxMaMHResult[0].MaxMaMH : 0; // Lấy giá trị số lớn nhất
  
      // Tạo mã môn học mới
      let nextMaMH = 'MH1'; // Mã môn học khởi tạo ban đầu
      if (maxMaMH) {
        const currentNumber = parseInt(maxMaMH); // Lấy số từ MaMH hiện tại
        const nextNumber = currentNumber + 1;
        nextMaMH = 'MH' + nextNumber.toString().padStart(1, '0'); // Tạo mã môn học tăng dần
      }
  
      const insertMonHocQuery = `
        INSERT INTO dbo.MonHoc (MaMH, TenMH, SoTietLT, SoTietTH, SoTinChi, HeSoCC, HeSoGK, HeSoCK)
        VALUES ('${nextMaMH}', N'${TenMH}', ${SoTietLT}, ${SoTietTH}, ${SoTinChi}, ${HeSoCC}, ${HeSoGK}, ${HeSoCK})
      `;
  
      await pool.executeQuery(insertMonHocQuery);
  
      res.status(200).json({ success: true, message: 'Thêm môn học thành công', MaMH: nextMaMH });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let suaMonHoc = async (req, res) => {
    const { MaMH } = req.params;
    const { TenMH, SoTietLT, SoTietTH, SoTinChi, HeSoCC, HeSoGK, HeSoCK } = req.body;
  
    try {
      // Kiểm tra xem môn học có tồn tại hay không
      const checkMonHocQuery = `SELECT * FROM dbo.MonHoc WHERE MaMH = '${MaMH}'`;
      const checkMonHocResult = await pool.executeQuery(checkMonHocQuery);
  
      if (checkMonHocResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy môn học' });
      }
  
      // Sửa thông tin môn học
      const updateMonHocQuery = `
        UPDATE dbo.MonHoc
        SET TenMH = N'${TenMH}', SoTietLT = ${SoTietLT}, SoTietTH = ${SoTietTH}, SoTinChi = ${SoTinChi},
        HeSoCC = ${HeSoCC}, HeSoGK = ${HeSoGK}, HeSoCK = ${HeSoCK}
        WHERE MaMH = '${MaMH}'
      `;
  
      await pool.executeQuery(updateMonHocQuery);
  
      res.status(200).json({ success: true, message: 'Cập nhật thông tin môn học thành công', MaMH });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let xoaMonHoc = async (req, res) => {
    const { MaMH } = req.params;
  
    try {
      // Kiểm tra xem môn học có tồn tại hay không
      const checkMonHocQuery = `SELECT * FROM dbo.MonHoc WHERE MaMH = '${MaMH}'`;
      const checkMonHocResult = await pool.executeQuery(checkMonHocQuery);
  
      if (checkMonHocResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy môn học' });
      }
  
      // Kiểm tra xem môn học có liên quan đến lớp tín chỉ đang trong thời gian học hay không
      const checkLopTinChiQuery = `SELECT * FROM dbo.LopTinChi WHERE MaMH = '${MaMH}' AND GETDATE() BETWEEN NgayBD AND NgayKT`;
      const checkLopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (checkLopTinChiResult.length > 0) {
        return res.status(400).json({ error: 'Môn học đang trong thời gian học, không thể xóa mềm' });
      }
  
      // Cập nhật trạng thái môn học thành không hoạt động (Active = 0)
      const updateMonHocQuery = `UPDATE dbo.MonHoc SET Active = 0 WHERE MaMH = '${MaMH}'`;
  
      await pool.executeQuery(updateMonHocQuery);
  
      res.status(200).json({ success: true, message: 'Xóa môn học thành công', MaMH });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let hienThiDanhSachLopTinChi = async (req, res) => {
    try {
      // Lấy danh sách toàn bộ lớp tín chỉ
      const getDanhSachLopTCQuery = `SELECT * FROM LopTinChi`;
      const danhSachLopTCResult = await pool.executeQuery(getDanhSachLopTCQuery);
  
      res.status(200).json({ success: true, danhSachLopTC: danhSachLopTCResult });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let chinhSuaLopTinChi = async (req, res) => {
    const { MaLTC, NamHoc, HocKi, SLToiDa, NgayBD, NgayKT } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Cập nhật thông tin của lớp tín chỉ
      const updateLopTinChiQuery = `
        UPDATE LopTinChi
        SET NamHoc = '${NamHoc}', HocKi = '${HocKi}', SLToiDa = ${SLToiDa}, NgayBD = '${NgayBD}', NgayKT = '${NgayKT}'
        WHERE MaLTC = '${MaLTC}'
      `;
      await pool.executeQuery(updateLopTinChiQuery);
  
      res.status(200).json({ success: true, message: 'Chỉnh sửa lớp tín chỉ thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let xoaLopTinChi = async (req, res) => {
    const { MaLTC } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ đã được đăng kí hay chưa
      const checkDangKiQuery = `SELECT * FROM DangKi WHERE MaLTC = '${MaLTC}'`;
      const dangKiResult = await pool.executeQuery(checkDangKiQuery);
  
      if (dangKiResult.length > 0) {
        return res.status(400).json({ error: 'Không thể xóa lớp tín chỉ đã được đăng kí' });
      }
  
      // Cập nhật cờ active của lớp tín chỉ thành 0 (xóa mềm)
      const xoaMemLopTinChiQuery = `
        UPDATE LopTinChi
        SET Active = 0
        WHERE MaLTC = '${MaLTC}'
      `;
      await pool.executeQuery(xoaMemLopTinChiQuery);
  
      res.status(200).json({ success: true, message: 'Xóa mềm lớp tín chỉ thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  let hienThiDanhSachDangKi = async (req, res) => {
    const { MaLTC } = req.params;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTCQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTCResult = await pool.executeQuery(checkLopTCQuery);
  
      if (lopTCResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Lấy danh sách đăng kí của lớp tín chỉ
      const getDanhSachDangKiQuery = `SELECT * FROM DangKi WHERE MaLTC = '${MaLTC}'`;
      const danhSachDangKiResult = await pool.executeQuery(getDanhSachDangKiQuery);
  
      res.status(200).json({ success: true, danhSachDangKi: danhSachDangKiResult });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  let chinhSuaDiemSinhVien = async (req, res) => {
    const { MaSV, MaLTC, DiemCC, DiemGK, DiemCK } = req.body;
  
    try {
      // Kiểm tra xem sinh viên có tồn tại hay không
      const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
      const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);
  
      if (sinhVienResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
      }
  
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Cập nhật điểm của sinh viên
      const updateDiemQuery = `
        UPDATE DangKi
        SET DiemCC = ${DiemCC}, DiemGK = ${DiemGK}, DiemCK = ${DiemCK}
        WHERE MaSV = '${MaSV}' AND MaLTC = '${MaLTC}'
      `;
      await pool.executeQuery(updateDiemQuery);
  
      res.status(200).json({ success: true, message: 'Chỉnh sửa điểm thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  let dieuChinhLichHoc = async (req, res) => {
    const { MaLTC, MaTGBs, MaPhongHoc } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Lấy danh sách các thời gian biểu hiện tại của lớp tín chỉ
      const getLichHocQuery = `SELECT MaTGB FROM LichHoc WHERE MaLTC = '${MaLTC}'`;
      const lichHocResult = await pool.executeQuery(getLichHocQuery);
      const existingLichHoc = lichHocResult.map((lich) => lich.MaTGB);
  
      // Tìm các thời gian biểu cần thêm và xóa
      const tgbThem = MaTGBs.filter((maTGB) => !existingLichHoc.includes(maTGB));
      const tgbXoa = existingLichHoc.filter((maTGB) => !MaTGBs.includes(maTGB));
  
      // Thêm các thời gian biểu mới vào bảng LichHoc
      if (tgbThem.length > 0) {
        const insertLichHocQuery = `INSERT INTO LichHoc (MaLTC, MaTGB, MaPhongHoc) VALUES `;
        const values = tgbThem.map((maTGB) => `('${MaLTC}', ${maTGB}, ${MaPhongHoc})`).join(', ');
        await pool.executeQuery(insertLichHocQuery + values);
      }
  
      // Xóa các thời gian biểu không còn trong danh sách MaTGBs
      if (tgbXoa.length > 0) {
        const deleteLichHocQuery = `DELETE FROM LichHoc WHERE MaLTC = '${MaLTC}' AND MaTGB IN (${tgbXoa.join(', ')})`;
        await pool.executeQuery(deleteLichHocQuery);
      }
  
      res.status(200).json({ success: true, message: 'Điều chỉnh lịch học thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let hienThiLichHoc = async (req, res) => {
    const { MaLTC } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Lấy danh sách các thời gian biểu hiện tại của lớp tín chỉ
      const getLichHocQuery = `SELECT LH.MaTGB, PH.MaPhongHoc FROM LichHoc LH JOIN PhongHoc PH ON LH.MaPhongHoc = PH.MaPhongHoc WHERE LH.MaLTC = '${MaLTC}'`;
      const lichHocResult = await pool.executeQuery(getLichHocQuery);
  
      const danhSachLichHoc = lichHocResult.map((lich) => ({
        MaTGB: lich.MaTGB,
        MaPhongHoc: lich.MaPhongHoc,
      }));
  
      res.status(200).json({ success: true, danhSachLichHoc });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let themLichHoc = async (req, res) => {
    const { MaLTC, MaTGB, MaPhongHoc } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Thêm thời gian biểu mới vào bảng LichHoc
      const insertLichHocQuery = `INSERT INTO LichHoc (MaLTC, MaTGB, MaPhongHoc) VALUES ('${MaLTC}', ${MaTGB}, '${MaPhongHoc}')`;
      await pool.executeQuery(insertLichHocQuery);
  
      res.status(200).json({ success: true, message: 'Thêm lịch học thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let xoaLichHoc = async (req, res) => {
    const { MaLTC, MaTGB, MaPhongHoc } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Xóa thời gian biểu ra khỏi bảng LichHoc
      const deleteLichHocQuery = `DELETE FROM LichHoc WHERE MaLTC = '${MaLTC}' AND MaTGB = ${MaTGB} AND MaPhongHoc = '${MaPhongHoc}'`;
      await pool.executeQuery(deleteLichHocQuery);
  
      res.status(200).json({ success: true, message: 'Xóa lịch học thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  module.exports = {
    getAllMonHoc,
    layMonHoc,
    themMonHoc,
    suaMonHoc,  
    xoaMonHoc,
    hienThiDanhSachLopTinChi,
    chinhSuaLopTinChi,
    xoaLopTinChi,
    hienThiDanhSachDangKi,
    
    chinhSuaDiemSinhVien,
    dieuChinhLichHoc, // đã fix
    hienThiLichHoc,
    themLichHoc,
    xoaLichHoc
  };