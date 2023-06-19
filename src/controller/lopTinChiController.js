const Database = require("../config/database");
const auth = require("../middleware/auth");

const pool = Database.getInstance();
pool.connect();

let getAllLopTinChi = async (req, res) => {
  try {
    const query = "SELECT * FROM dbo.LopTinChi";
    const result = await pool.executeQuery(query);

    res.status(200).json({ success: true, lopTinChi: result });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let layLopTinChi = async (req, res) => {
  const { MaLTC } = req.params;

  try {
    const query = `SELECT * FROM dbo.LopTinChi WHERE MaLTC = '${MaLTC}'`;
    const result = await pool.executeQuery(query);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
    }

    const lopTinChi = result[0];

    res.status(200).json({ success: true, message: 'Lấy thông tin lớp tín chỉ thành công', lopTinChi });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let themLopTinChi = async (req, res) => {
  const { MaLTC, NamHoc, HocKi, SLToiDa, NgayBD, NgayKT, MaMH } = req.body;

  try {
    const insertLopTinChiQuery = `
      INSERT INTO dbo.LopTinChi (MaLTC, NamHoc, HocKi, SLToiDa, NgayBD, NgayKT, MaMH)
      VALUES ('${MaLTC}', '${NamHoc}', '${HocKi}', ${SLToiDa}, '${NgayBD}', '${NgayKT}', '${MaMH}')
    `;

    await pool.executeQuery(insertLopTinChiQuery);

    res.status(200).json({ success: true, message: 'Thêm lớp tín chỉ thành công', MaLTC });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let suaLopTinChi = async (req, res) => {
  const { MaLTC } = req.params;
  const { NamHoc, HocKi, SLToiDa, NgayBD, NgayKT, MaMH } = req.body;

  try {
    const checkLopTinChiQuery = `SELECT * FROM dbo.LopTinChi WHERE MaLTC = '${MaLTC}'`;
    const checkLopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);

    if (checkLopTinChiResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
    }

    const updateLopTinChiQuery = `
      UPDATE dbo.LopTinChi
      SET NamHoc = '${NamHoc}', HocKi = '${HocKi}', SLToiDa = ${SLToiDa},
      NgayBD = '${NgayBD}', NgayKT = '${NgayKT}', MaMH = '${MaMH}'
      WHERE MaLTC = '${MaLTC}'
    `;

    await pool.executeQuery(updateLopTinChiQuery);

    res.status(200).json({ success: true, message: 'Cập nhật thông tin lớp tín chỉ thành công', MaLTC });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let xoaLopTinChi = async (req, res) => {
    const { MaLTC } = req.params;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM dbo.LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const checkLopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (checkLopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Kiểm tra xem lớp tín chỉ có tồn tại trong bảng DangKi
      const checkDangKiQuery = `SELECT * FROM dbo.DangKi WHERE MaLTC = '${MaLTC}'`;
      const checkDangKiResult = await pool.executeQuery(checkDangKiQuery);
  
      if (checkDangKiResult.length > 0) {
        // Nếu lớp tín chỉ đã hoặc đang được sinh viên đăng ký, cập nhật trạng thái thành không hoạt động (Active = 0)
        const updateLopTinChiQuery = `UPDATE dbo.LopTinChi SET Active = 0 WHERE MaLTC = '${MaLTC}'`;
        await pool.executeQuery(updateLopTinChiQuery);
  
        res.status(200).json({ success: true, message: 'Xóa mềm lớp tín chỉ thành công', MaLTC });
      } else {
        // Nếu lớp tín chỉ không có trong bảng DangKi, thực hiện xóa lớp tín chỉ
        const deleteLopTinChiQuery = `DELETE FROM dbo.LopTinChi WHERE MaLTC = '${MaLTC}'`;
        await pool.executeQuery(deleteLopTinChiQuery);
  
        res.status(200).json({ success: true, message: 'Xóa luôn lớp tín chỉ thành công', MaLTC });
      }
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

module.exports = {
  getAllLopTinChi,
  layLopTinChi,
  themLopTinChi,
  suaLopTinChi,
  xoaLopTinChi,
};
