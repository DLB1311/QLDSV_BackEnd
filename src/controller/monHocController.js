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
  
      // Xóa môn học
      const deleteMonHocQuery = `DELETE FROM dbo.MonHoc WHERE MaMH = '${MaMH}'`;
  
      await pool.executeQuery(deleteMonHocQuery);
  
      res.status(200).json({ success: true, message: 'Xóa môn học thành công', MaMH });
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
  };