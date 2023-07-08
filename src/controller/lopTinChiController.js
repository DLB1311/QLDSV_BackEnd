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
  const { NamHoc, HocKi, SLToiDa, NgayBD, NgayKT, MaMH } = req.body;

  try {
    // Lấy MaLTC lớn nhất hiện tại từ bảng LopTinChi để xác định số tiếp theo
    const getMaxMaLTCQuery = "SELECT MAX(CAST(SUBSTRING(MaLTC, 4, LEN(MaLTC)) AS INT)) AS MaxMaLTC FROM dbo.LopTinChi";
    const maxMaLTCResult = await pool.executeQuery(getMaxMaLTCQuery);
    const maxMaLTC = maxMaLTCResult.length > 0 ? maxMaLTCResult[0].MaxMaLTC : 0; // Lấy giá trị số lớn nhất

    // Tạo mã lớp tín chỉ mới
    let nextMaLTC = 'LTC1'; // Mã lớp tín chỉ khởi tạo ban đầu
    if (maxMaLTC) {
      const currentNumber = parseInt(maxMaLTC); // Lấy số từ MaLTC hiện tại
      const nextNumber = currentNumber + 1;
      nextMaLTC = 'LTC' + nextNumber.toString().padStart(1, '0'); // Tạo mã lớp tín chỉ tăng dần
    }

    const insertLopTinChiQuery = `
      INSERT INTO dbo.LopTinChi (MaLTC, NamHoc, HocKi, SLToiDa, NgayBD, NgayKT, MaMH)
      VALUES ('${nextMaLTC}', '${NamHoc}', '${HocKi}', ${SLToiDa}, '${NgayBD}', '${NgayKT}', '${MaMH}')
    `;

    await pool.executeQuery(insertLopTinChiQuery);

    res.status(200).json({ success: true, message: 'Thêm lớp tín chỉ thành công', MaLTC: nextMaLTC });
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
  
  let hienThiDanhSachLichHoc = async (req, res) => {
    try {
      // Truy vấn SQL để lấy danh sách LichHoc với các thông tin cần thiết
      const query = `
        SELECT lh.MaLTC, lh.MaTGB, lh.MaPhongHoc, mh.TenMH, tg.TenPhongHoc
        FROM LichHoc lh
        INNER JOIN LopTinChi ltc ON lh.MaLTC = ltc.MaLTC
        INNER JOIN MonHoc mh ON ltc.MaMH = mh.MaMH
        INNER JOIN ThoiGianBieu tg ON lh.MaTGB = tg.MaTGB
        INNER JOIN PhongHoc ph ON lh.MaPhongHoc = ph.MaPhongHoc
      `;
  
      // Thực hiện truy vấn
      const result = await pool.executeQuery(query);
  
      // Trả về kết quả
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  let hienThiLichHocChuaCoTrongLopTinChi = async (req, res) => {
    try {
      const { MaLTC } = req.params;
  
      // Lấy danh sách các lịch học có sẵn
      const queryLichHoc = `SELECT MaTGB FROM LichHoc`;
      const resultLichHoc = await pool.executeQuery(queryLichHoc);
      const lichHocDaCo = resultLichHoc.map((lichHoc) => lichHoc.MaTGB);
  
      // Lấy danh sách các lịch học mà lớp tín chỉ chưa có
      const queryLichHocChuaCo = `
        SELECT MaTGB, Thu, Buoi
        FROM ThoiGianBieu
        WHERE MaTGB NOT IN (${lichHocDaCo.join(',')})
      `;
      const resultLichHocChuaCo = await pool.executeQuery(queryLichHocChuaCo);
  
      res.status(200).json({ success: true, lichHocChuaCo: resultLichHocChuaCo });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let hienThiPhongHocChuaCoTrongLopTinChi = async (req, res) => {
    try {
      const { MaLTC } = req.params;
  
      // Lấy danh sách các phòng học có sẵn
      const queryPhongHoc = `SELECT MaPhongHoc FROM PhongHoc`;
      const resultPhongHoc = await pool.executeQuery(queryPhongHoc);
      const phongHocDaCo = resultPhongHoc.map((phongHoc) => phongHoc.MaPhongHoc);
  
      // Lấy danh sách các phòng học mà lớp tín chỉ chưa có
      const queryPhongHocChuaCo = `
        SELECT MaPhongHoc, TenPhong
        FROM PhongHoc
        WHERE MaPhongHoc NOT IN (
          SELECT MaPhongHoc
          FROM LichHoc
          WHERE MaLTC = '${MaLTC}'
        )
      `;
      const resultPhongHocChuaCo = await pool.executeQuery(queryPhongHocChuaCo);
  
      res.status(200).json({ success: true, phongHocChuaCo: resultPhongHocChuaCo });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let hienThiLichHocVaPhongHocCuaLopTinChi = async (req, res) => {
    try {
      const { MaLTC } = req.params;
  
      // Lấy thông tin về lịch học và phòng học của lớp tín chỉ
      const query = `
        SELECT LichHoc.MaTGB, ThoiGianBieu.Thu, ThoiGianBieu.Buoi, PhongHoc.MaPhongHoc, PhongHoc.TenPhong
        FROM LichHoc
        INNER JOIN ThoiGianBieu ON LichHoc.MaTGB = ThoiGianBieu.MaTGB
        INNER JOIN PhongHoc ON LichHoc.MaPhongHoc = PhongHoc.MaPhongHoc
        WHERE LichHoc.MaLTC = '${MaLTC}'
      `;
      const result = await pool.executeQuery(query);
  
      res.status(200).json({
        success: true,
        lichHocPhongHoc: result,
      });
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
  
      // Kiểm tra xem thời gian biểu có tồn tại hay không
      const checkThoiGianBieuQuery = `SELECT * FROM ThoiGianBieu WHERE MaTGB = ${MaTGB}`;
      const thoiGianBieuResult = await pool.executeQuery(checkThoiGianBieuQuery);
  
      if (thoiGianBieuResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy thời gian biểu' });
      }
  
      // Kiểm tra xem phòng học có tồn tại hay không
      const checkPhongHocQuery = `SELECT * FROM PhongHoc WHERE MaPhongHoc = ${MaPhongHoc}`;
      const phongHocResult = await pool.executeQuery(checkPhongHocQuery);
  
      if (phongHocResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy phòng học' });
      }
  
      // Kiểm tra xem lịch học đã tồn tại hay chưa
      const checkLichHocQuery = `
        SELECT * FROM LichHoc
        WHERE MaLTC = '${MaLTC}'
          AND MaTGB = ${MaTGB}
          AND MaPhongHoc = ${MaPhongHoc}
      `;
      const lichHocResult = await pool.executeQuery(checkLichHocQuery);
  
      if (lichHocResult.length > 0) {
        return res.status(400).json({ error: 'Lịch học đã tồn tại' });
      }
  
      // Kiểm tra xem lớp tín chỉ khác có trùng thời gian biểu và phòng học
      const checkConflictQuery = `
        SELECT * FROM LichHoc LH
        INNER JOIN LopTinChi LTC ON LH.MaLTC = LTC.MaLTC
        WHERE LTC.NgayBD <= (
          SELECT NgayKT FROM LopTinChi WHERE MaLTC = '${MaLTC}'
        )
        AND LTC.NgayKT >= (
          SELECT NgayBD FROM LopTinChi WHERE MaLTC = '${MaLTC}'
        )
        AND LH.MaTGB = ${MaTGB}
        AND LH.MaPhongHoc = ${MaPhongHoc}
      `;
      const conflictResult = await pool.executeQuery(checkConflictQuery);
  
      if (conflictResult.length > 0) {
        return res.status(400).json({ error: 'Trùng thời gian biểu và phòng học với lớp tín chỉ khác' });
      }
  
      // Thêm lịch học vào cơ sở dữ liệu
      const insertLichHocQuery = `
        INSERT INTO LichHoc (MaLTC, MaTGB, MaPhongHoc)
        VALUES ('${MaLTC}', ${MaTGB}, ${MaPhongHoc})
      `;
      await pool.executeQuery(insertLichHocQuery);
  
      res.status(200).json({ success: true, message: 'Thêm lịch học thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  let xoaLichHocVaPhongHoc = async (req, res) => {
    const { MaLTC, MaTGB, MaPhongHoc } = req.body;
  
    try {
      // Kiểm tra xem lớp tín chỉ có tồn tại hay không
      const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
      const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
      if (lopTinChiResult.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
      }
  
      // Xóa lịch học và phòng học liên quan
      const deleteLichHocQuery = `
        DELETE FROM LichHoc
        WHERE MaLTC = '${MaLTC}'
          AND MaTGB = ${MaTGB}
          AND MaPhongHoc = ${MaPhongHoc}
      `;
      await pool.executeQuery(deleteLichHocQuery);
  
      res.status(200).json({ success: true, message: 'Xóa lịch học và phòng học thành công' });
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };


  // let xoaLichHoc = async (req, res) => {
  //   const { MaLTC } = req.params;
  
  //   try {
  //     // Kiểm tra xem lớp tín chỉ có tồn tại hay không
  //     const checkLopTinChiQuery = `SELECT * FROM LopTinChi WHERE MaLTC = '${MaLTC}'`;
  //     const lopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);
  
  //     if (lopTinChiResult.length === 0) {
  //       return res.status(404).json({ error: 'Không tìm thấy lớp tín chỉ' });
  //     }
  
  //     // Kiểm tra xem lịch học có tồn tại hay không
  //     const checkLichHocQuery = `SELECT * FROM LichHoc WHERE MaLTC = '${MaLTC}'`;
  //     const lichHocResult = await pool.executeQuery(checkLichHocQuery);
  
  //     if (lichHocResult.length === 0) {
  //       return res.status(404).json({ error: 'Không tìm thấy lịch học' });
  //     }
  
  //     // Xóa lịch học khỏi cơ sở dữ liệu
  //     const deleteLichHocQuery = `DELETE FROM LichHoc WHERE MaLTC = '${MaLTC}'`;
  //     await pool.executeQuery(deleteLichHocQuery);
  
  //     res.status(200).json({ success: true, message: 'Xóa lịch học thành công' });
  //   } catch (error) {
  //     console.log('Error:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // };
  
  
  

module.exports = {
  getAllLopTinChi,
  layLopTinChi,
  themLopTinChi,
  suaLopTinChi,
  xoaLopTinChi,

  hienThiDanhSachLichHoc,

  hienThiLichHocChuaCoTrongLopTinChi,
  hienThiPhongHocChuaCoTrongLopTinChi,
  hienThiLichHocVaPhongHocCuaLopTinChi,
  themLichHoc,
  xoaLichHocVaPhongHoc,
  // xoaLichHoc,
};
