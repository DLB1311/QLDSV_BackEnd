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

    // Kiểm tra xem sinh viên đang học lớp tín chỉ nào và lớp tín chỉ đó vẫn đang trong quá trình dạy
    const checkLopTinChiQuery = `SELECT ltc.* FROM dbo.LopTinChi ltc
                                INNER JOIN dbo.DangKi dk ON ltc.MaLTC = dk.MaLTC
                                INNER JOIN dbo.MonHoc mh ON ltc.MaMH = mh.MaMH
                                WHERE dk.MaSV = '${MaSV}' AND ltc.Active = 1 AND GETDATE() BETWEEN ltc.NgayBD AND ltc.NgayKT`;
    const checkLopTinChiResult = await pool.executeQuery(checkLopTinChiQuery);

    if (checkLopTinChiResult.length > 0) {
      return res.status(400).json({ error: 'Sinh viên đang học lớp tín chỉ đang trong quá trình dạy, không thể cho nghỉ' });
    }

    // Cập nhật trạng thái nghỉ cho sinh viên
    const updateSinhVienQuery = `UPDATE dbo.SinhVien SET Active = 0 WHERE MaSV = '${MaSV}'`;
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
let hienThiDiemTheoHocKi = async (req, res) => {
  const userInfo = await auth.getUserIdFromToken(req);
  console.log(userInfo.MaTk);
  if (!userInfo || !userInfo.MaTk) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const MaSV = userInfo.MaTk;
  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Lấy danh sách các học kỳ, điểm, số tín chỉ đã đạt và số tín chỉ đã rớt của sinh viên
    const getDiemQuery = `
      SELECT LopTinChi.HocKi, MonHoc.TenMH AS TenMonHoc, DangKi.DiemCC, DangKi.DiemGK, DangKi.DiemCK,
        (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) AS DiemTB,
        CASE WHEN (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) >= 4 THEN MonHoc.SoTinChi ELSE 0 END AS TinChiDat,
        CASE WHEN (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) < 4 THEN MonHoc.SoTinChi ELSE 0 END AS TinChiRot
      FROM LopTinChi
      LEFT JOIN DangKi ON LopTinChi.MaLTC = DangKi.MaLTC
      LEFT JOIN MonHoc ON LopTinChi.MaMH = MonHoc.MaMH
      WHERE DangKi.MaSV = '${MaSV}'
      ORDER BY LopTinChi.HocKi ASC, MonHoc.TenMH ASC
    `;
    const diemResult = await pool.executeQuery(getDiemQuery);

    // Gom nhóm theo HocKi
    const hocKiData = {};
    diemResult.forEach((diem) => {
      const { HocKi, TenMonHoc, DiemCC, DiemGK, DiemCK, DiemTB, TinChiDat, TinChiRot } = diem;
      if (!hocKiData[HocKi]) {
        hocKiData[HocKi] = {
          Mon: [],
          DiemTBTongMon: 0, // Thêm trường DiemTBTongMon để tính toán điểm trung bình tổng môn
        };
      }
      hocKiData[HocKi].Mon.push({
        TenMonHoc,
        DiemCC,
        DiemGK,
        DiemCK,
        DiemTB
      });
      hocKiData[HocKi].SoTinChiDat = (hocKiData[HocKi].SoTinChiDat || 0) + TinChiDat;
      hocKiData[HocKi].SoTinChiRot = (hocKiData[HocKi].SoTinChiRot || 0) + TinChiRot;
      hocKiData[HocKi].DiemTBTongMon += DiemTB; // Tính toán tổng điểm trung bình các môn
    });

    // Tính toán điểm trung bình tổng môn
    Object.keys(hocKiData).forEach((hocKi) => {
      const monCount = hocKiData[hocKi].Mon.length;
      hocKiData[hocKi].DiemTBTongMon = hocKiData[hocKi].DiemTBTongMon / monCount;
    });

    // Trả về kết quả dưới dạng JSON
    res.status(200).json({ HocKi: hocKiData });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


let hienThiDiemTheoHocKi1 = async (req, res) => {


  const {MaSV }= req.body;
  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Lấy danh sách các học kỳ, điểm, số tín chỉ đã đạt và số tín chỉ đã rớt của sinh viên
    const getDiemQuery = `
      SELECT LopTinChi.HocKi, MonHoc.TenMH AS TenMonHoc, DangKi.DiemCC, DangKi.DiemGK, DangKi.DiemCK,
        (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) AS DiemTB,
        CASE WHEN (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) >= 4 THEN MonHoc.SoTinChi ELSE 0 END AS TinChiDat,
        CASE WHEN (DangKi.DiemCC * MonHoc.HeSoCC + DangKi.DiemGK * MonHoc.HeSoGK + DangKi.DiemCK * MonHoc.HeSoCK) / (MonHoc.HeSoCC + MonHoc.HeSoGK + MonHoc.HeSoCK) < 4 THEN MonHoc.SoTinChi ELSE 0 END AS TinChiRot
      FROM LopTinChi
      LEFT JOIN DangKi ON LopTinChi.MaLTC = DangKi.MaLTC
      LEFT JOIN MonHoc ON LopTinChi.MaMH = MonHoc.MaMH
      WHERE DangKi.MaSV = '${MaSV}'
      ORDER BY LopTinChi.HocKi ASC, MonHoc.TenMH ASC
    `;
    const diemResult = await pool.executeQuery(getDiemQuery);

    // Gom nhóm theo HocKi
    const hocKiData = {};
    diemResult.forEach((diem) => {
      const { HocKi, TenMonHoc, DiemCC, DiemGK, DiemCK, DiemTB, TinChiDat, TinChiRot } = diem;
      if (!hocKiData[HocKi]) {
        hocKiData[HocKi] = {
          Mon: []
        };
      }
      hocKiData[HocKi].Mon.push({
        TenMonHoc,
        DiemCC,
        DiemGK,
        DiemCK,
        DiemTB
      });
      hocKiData[HocKi].SoTinChiDat = (hocKiData[HocKi].SoTinChiDat || 0) + TinChiDat;
      hocKiData[HocKi].SoTinChiRot = (hocKiData[HocKi].SoTinChiRot || 0) + TinChiRot;
    });

    // Trả về kết quả dưới dạng JSON
    res.status(200).json({ HocKi: hocKiData });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


let hienThiLopChuaCoDiemVaChuaDenThoiGianBatDau = async (req, res) => {
  const { MaSV } = req.body;

  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Lấy danh sách các lớp tín chỉ mà sinh viên đã đăng kí nhưng chưa có điểm và chưa đến thời gian bắt đầu học
    const getLopChuaCoDiemVaChuaDenThoiGianQuery = `
      SELECT ltc.MaLTC, mh.TenMH, ltc.NgayBD
      FROM LopTinChi ltc
      INNER JOIN MonHoc mh ON ltc.MaMH = mh.MaMH
      LEFT JOIN DangKi dk ON ltc.MaLTC = dk.MaLTC AND dk.MaSV = '${MaSV}'
      WHERE (dk.MaLTC IS NULL OR (dk.DiemCC IS NULL AND dk.DiemGK IS NULL AND dk.DiemCK IS NULL))
        AND ltc.NgayBD > GETDATE()
    `;
    const lopChuaCoDiemVaChuaDenThoiGianResult = await pool.executeQuery(getLopChuaCoDiemVaChuaDenThoiGianQuery);

    res.status(200).json({ success: true, lopChuaCoDiemVaChuaDenThoiGian: lopChuaCoDiemVaChuaDenThoiGianResult });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


let dieuChinhDangKiMonHoc = async (req, res) => {
  const { MaSV, MaLTCs } = req.body;

  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Lấy danh sách các lớp tín chỉ sinh viên đã đăng kí
    const getDangKiQuery = `SELECT MaLTC, DiemCC, DiemGK, DiemCK FROM DangKi WHERE MaSV = '${MaSV}'`;
    const dangKiResult = await pool.executeQuery(getDangKiQuery);
    const existingDangKi = dangKiResult.map((dangKi) => dangKi.MaLTC);

    // Tìm các lớp tín chỉ cần thêm và bỏ
    const lopThem = MaLTCs.filter((maLTC) => !existingDangKi.includes(maLTC));
    const lopBo = existingDangKi.filter((maLTC) => !MaLTCs.includes(maLTC));

    // Thêm các lớp tín chỉ mới vào bảng DangKi
    if (lopThem.length > 0) {
      // Kiểm tra điều kiện trùng lịch cho các lớp tín chỉ mới
      const checkTrungLichQuery = `
        SELECT DISTINCT lh.MaLTC
        FROM LichHoc lh
        INNER JOIN LopTinChi ltc ON ltc.MaLTC = lh.MaLTC
        WHERE lh.MaLTC IN ('${lopThem.join("', '")}')
        AND lh.MaLTC NOT IN (
          SELECT MaLTC
          FROM DangKi
          WHERE MaSV = '${MaSV}'
        )
        AND lh.MaTGB IN (
          SELECT MaTGB
          FROM LichHoc
          WHERE MaLTC IN (
            SELECT MaLTC
            FROM DangKi
            WHERE MaSV = '${MaSV}'
          )
        )
      `;
      const trungLichResult = await pool.executeQuery(checkTrungLichQuery);

      if (trungLichResult.length > 0) {
        const trungLichMaLTCs = trungLichResult.map((trungLich) => trungLich.MaLTC);
        return res.status(400).json({ error: `Lớp tín chỉ ${trungLichMaLTCs.join(', ')} trùng lịch với các lớp tín chỉ đã đăng kí` });
      }

      // Kiểm tra điều kiện lớp tín chỉ chưa bắt đầu học
      const checkLopChuaBatDauQuery = `
        SELECT MaLTC
        FROM LopTinChi
        WHERE MaLTC IN ('${lopThem.join("', '")}')
        AND NgayBD > CONVERT(DATE, GETDATE())
      `;
      const lopChuaBatDauResult = await pool.executeQuery(checkLopChuaBatDauQuery);

      if (lopChuaBatDauResult.length == 0) {
        const lopChuaBatDauMaLTCs = lopChuaBatDauResult.map((lopChuaBatDau) => lopChuaBatDau.MaLTC);
        return res.status(400).json({ error: `Lớp tín chỉ ${lopChuaBatDauMaLTCs.join(', ')} đã bắt đầu học` });
      }

      const insertDangKiQuery = `INSERT INTO DangKi (MaLTC, MaSV) VALUES `;
      const values = lopThem.map((maLTC) => `('${maLTC}', '${MaSV}')`).join(', ');
      await pool.executeQuery(insertDangKiQuery + values);
    }

    // Xóa các lớp tín chỉ không còn trong danh sách MaLTCs (nếu chưa có điểm và chưa bắt đầu học)
    if (lopBo.length > 0) {
      const deleteDangKiQuery = `
        DELETE FROM DangKi
        WHERE MaSV = '${MaSV}'
        AND MaLTC IN ('${lopBo.join("', '")}')
        AND (DiemCC IS NULL AND DiemGK IS NULL AND DiemCK IS NULL)
        AND MaLTC NOT IN (
          SELECT ltc.MaLTC
          FROM LopTinChi ltc
          WHERE ltc.NgayBD < CONVERT(DATE, GETDATE())
        )
      `;
      await pool.executeQuery(deleteDangKiQuery);
    }

    res.status(200).json({ success: true, message: 'Điều chỉnh đăng kí môn học thành công' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let hienThiLopTinChiChuaDangKi = async (req, res) => {
  try {
    // Lấy thông tin từ token
    const userInfo = await auth.getUserIdFromToken(req);
    console.log(userInfo.MaTk);
    if (!userInfo || !userInfo.MaTk) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const MaSV = userInfo.MaTk;
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Hiển thị danh sách các lớp tín chỉ chưa đăng kí của sinh viên
    const hienThiLopTinChiQuery = `
      SELECT LTC.MaLTC, LTC.NamHoc, LTC.HocKi, LTC.SLToiDa, LTC.NgayBD, LTC.NgayKT, LTC.Active, LTC.MaMH, (LTC.SLToiDa - COUNT(DK.MaLTC)) AS SoLuongConLai
      FROM LopTinChi LTC
      LEFT JOIN DangKi DK ON LTC.MaLTC = DK.MaLTC AND DK.MaSV = '${MaSV}'
      WHERE LTC.Active = 1
      GROUP BY LTC.MaLTC, LTC.NamHoc, LTC.HocKi, LTC.SLToiDa, LTC.NgayBD, LTC.NgayKT, LTC.Active, LTC.MaMH
      HAVING COUNT(DK.MaLTC) = 0
    `;
    const lopTinChiResult = await pool.executeQuery(hienThiLopTinChiQuery);

    // Tính số lượng sinh viên đã đăng kí vào từng lớp
    const soLuongDaDangKiQuery = `
      SELECT MaLTC, COUNT(MaLTC) AS SoLuongDaDangKi
      FROM DangKi
      WHERE MaLTC IN (SELECT MaLTC FROM LopTinChi WHERE Active = 1)
      GROUP BY MaLTC
    `;
    const soLuongDaDangKiResult = await pool.executeQuery(soLuongDaDangKiQuery);

    // Tạo một đối tượng để lưu số lượng còn lại của từng lớp
    const soLuongConLaiMap = {};
    for (const lopTinChi of lopTinChiResult) {
      const maLTC = lopTinChi.MaLTC;
      soLuongConLaiMap[maLTC] = lopTinChi.SLToiDa;
    }

    // Cập nhật số lượng còn lại dựa trên số lượng sinh viên đã đăng kí
    for (const dangKi of soLuongDaDangKiResult) {
      const maLTC = dangKi.MaLTC;
      const soLuongDaDangKi = dangKi.SoLuongDaDangKi;
      soLuongConLaiMap[maLTC] -= soLuongDaDangKi;
    }

    // Cập nhật số lượng còn lại trong kết quả trả về
    for (const lopTinChi of lopTinChiResult) {
      const maLTC = lopTinChi.MaLTC;
      lopTinChi.SoLuongConLai = soLuongConLaiMap[maLTC];
    }

    res.status(200).json({ success: true, data: lopTinChiResult });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


let hienThiLopTinChiDaDangKi = async (req, res) => {
  try {
    // Lấy thông tin từ token
    const userInfo = await auth.getUserIdFromToken(req);
    if (!userInfo || !userInfo.MaTk) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const  MaSV  = userInfo.MaTk;

    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Hiển thị danh sách các lớp tín chỉ sinh viên đã đăng kí
    const hienThiLopTinChiQuery = `
      SELECT LTC.MaLTC, LTC.NamHoc, LTC.HocKi, LTC.SLToiDa, LTC.NgayBD, LTC.NgayKT, LTC.Active, LTC.MaMH
      FROM LopTinChi LTC
      INNER JOIN DangKi DK ON LTC.MaLTC = DK.MaLTC
      WHERE DK.MaSV = '${MaSV}' AND LTC.Active = 1
    `;
    const lopTinChiResult = await pool.executeQuery(hienThiLopTinChiQuery);

    res.status(200).json({ success: true, data: lopTinChiResult });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const dangKiLopTinChi = async (req, res) => {
  const { MaSV, MaLTCs } = req.body;

  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Kiểm tra điều kiện trùng lịch cho các lớp tín chỉ mới
    const checkTrungLichQuery = `
      SELECT DISTINCT lh.MaLTC
      FROM LichHoc lh
      INNER JOIN LopTinChi ltc ON ltc.MaLTC = lh.MaLTC
      WHERE lh.MaLTC IN ('${MaLTCs.join("', '")}')
      AND lh.MaLTC NOT IN (
        SELECT MaLTC
        FROM DangKi
        WHERE MaSV = '${MaSV}'
      )
      AND lh.MaTGB IN (
        SELECT MaTGB
        FROM LichHoc
        WHERE MaLTC IN (
          SELECT MaLTC
          FROM DangKi
          WHERE MaSV = '${MaSV}'
        )
      )
    `;
    const trungLichResult = await pool.executeQuery(checkTrungLichQuery);

    if (trungLichResult.length > 0) {
      const trungLichMaLTCs = trungLichResult.map((trungLich) => trungLich.MaLTC);
      return res.status(400).json({ error: `Lớp tín chỉ ${trungLichMaLTCs.join(', ')} trùng lịch với các lớp tín chỉ đã đăng kí` });
    }

    // Kiểm tra điều kiện lớp tín chỉ chưa bắt đầu học
    const checkLopChuaBatDauQuery = `
      SELECT MaLTC
      FROM LopTinChi
      WHERE MaLTC IN ('${MaLTCs.join("', '")}')
      AND NgayBD > CONVERT(DATE, GETDATE())
    `;
    const lopChuaBatDauResult = await pool.executeQuery(checkLopChuaBatDauQuery);

    if (lopChuaBatDauResult.length == 0) {
      const lopChuaBatDauMaLTCs = lopChuaBatDauResult.map((lopChuaBatDau) => lopChuaBatDau.MaLTC);
      return res.status(400).json({ error: `Lớp tín chỉ ${lopChuaBatDauMaLTCs.join(', ')} đã bắt đầu học` });
    }

    // Thêm các lớp tín chỉ mới vào bảng DangKi
    const insertDangKiQuery = `INSERT INTO DangKi (MaLTC, MaSV) VALUES `;
    const values = MaLTCs.map((maLTC) => `('${maLTC}', '${MaSV}')`).join(', ');
    await pool.executeQuery(insertDangKiQuery + values);

    res.status(200).json({ success: true, message: 'Đăng ký lớp tín chỉ thành công' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const dangKi1LopTinChi = async (req, res) => {
  try {
    // Lấy thông tin từ token
    const userInfo = await auth.getUserIdFromToken(req);
    if (!userInfo || !userInfo.MaTk) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { MaLTC } = req.body;
    console.log(MaLTC)
    const MaSV = userInfo.MaTk;

    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Kiểm tra điều kiện trùng lịch cho lớp tín chỉ mới
    const checkTrungLichQuery = `
      SELECT DISTINCT lh.MaLTC
      FROM LichHoc lh
      INNER JOIN LopTinChi ltc ON ltc.MaLTC = lh.MaLTC
      WHERE lh.MaLTC = '${MaLTC}'
      AND lh.MaLTC NOT IN (
        SELECT MaLTC
        FROM DangKi
        WHERE MaSV = '${MaSV}'
      )
      AND lh.MaTGB IN (
        SELECT MaTGB
        FROM LichHoc
        WHERE MaLTC IN (
          SELECT MaLTC
          FROM DangKi
          WHERE MaSV = '${MaSV}'
        )
      )
    `;
    const trungLichResult = await pool.executeQuery(checkTrungLichQuery);

    if (trungLichResult.length > 0) {
      const trungLichMaLTCs = trungLichResult.map((trungLich) => trungLich.MaLTC);
      return res.status(400).json({ error: `Lớp tín chỉ ${trungLichMaLTCs.join(', ')} trùng lịch với các lớp tín chỉ đã đăng kí` });
    }

    // Kiểm tra điều kiện lớp tín chỉ chưa bắt đầu học
    const checkLopChuaBatDauQuery = `
      SELECT MaLTC
      FROM LopTinChi
      WHERE MaLTC = '${MaLTC}'
      AND NgayBD > CONVERT(DATE, GETDATE())
    `;
    const lopChuaBatDauResult = await pool.executeQuery(checkLopChuaBatDauQuery);

    if (lopChuaBatDauResult.length === 0) {
      return res.status(400).json({ error: `Lớp tín chỉ ${MaLTC} đã bắt đầu học` });
    }

    // Thêm lớp tín chỉ mới vào bảng DangKi
    const insertDangKiQuery = `INSERT INTO DangKi (MaLTC, MaSV) VALUES ('${MaLTC}', '${MaSV}')`;
    await pool.executeQuery(insertDangKiQuery);

    res.status(200).json({ success: true, message: 'Đăng ký lớp tín chỉ thành công' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const huyDangKiLopTinChi = async (req, res) => {
  const { MaSV, MaLTCs } = req.body;

  try {
    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Xóa các lớp tín chỉ không còn trong danh sách MaLTCs (nếu chưa có điểm và chưa bắt đầu học)
    const deleteDangKiQuery = `
      DELETE FROM DangKi
      WHERE MaSV = '${MaSV}'
      AND MaLTC IN ('${MaLTCs.join("', '")}')
      AND (DiemCC IS NULL AND DiemGK IS NULL AND DiemCK IS NULL)
      AND MaLTC NOT IN (
        SELECT ltc.MaLTC
        FROM LopTinChi ltc
        WHERE ltc.NgayBD < CONVERT(DATE, GETDATE())
      )
    `;
    await pool.executeQuery(deleteDangKiQuery);

    res.status(200).json({ success: true, message: 'Hủy đăng ký lớp tín chỉ thành công' });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const huyDangKi1LopTinChi = async (req, res) => {
  try {
    // Lấy thông tin từ token
    const userInfo = await auth.getUserIdFromToken(req);
    if (!userInfo || !userInfo.MaTk) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { MaLTC } = req.body;
    const MaSV = userInfo.MaTk;

    // Kiểm tra xem sinh viên có tồn tại hay không
    const checkSinhVienQuery = `SELECT * FROM SinhVien WHERE MaSV = '${MaSV}'`;
    const sinhVienResult = await pool.executeQuery(checkSinhVienQuery);

    if (sinhVienResult.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }

    // Kiểm tra xem lớp tín chỉ đã được đăng ký hay chưa
    const checkDangKiQuery = `
      SELECT * FROM DangKi
      WHERE MaSV = '${MaSV}'
      AND MaLTC = '${MaLTC}'
    `;
    const dangKiResult = await pool.executeQuery(checkDangKiQuery);

    if (dangKiResult.length === 0) {
      return res.status(400).json({ error: 'Lớp tín chỉ chưa được đăng ký' });
    }

    // Xóa lớp tín chỉ khỏi bảng DangKi (nếu chưa có điểm và chưa bắt đầu học)
    const deleteDangKiQuery = `
      DELETE FROM DangKi
      WHERE MaSV = '${MaSV}'
      AND MaLTC = '${MaLTC}'
      AND (DiemCC IS NULL AND DiemGK IS NULL AND DiemCK IS NULL)
      AND MaLTC NOT IN (
        SELECT ltc.MaLTC
        FROM LopTinChi ltc
        WHERE ltc.NgayBD < CONVERT(DATE, GETDATE())
      )
    `;
    await pool.executeQuery(deleteDangKiQuery);

    res.status(200).json({ success: true, message: 'Hủy đăng ký lớp tín chỉ thành công' });
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
  hienThiDiemTheoHocKi,
  hienThiDiemTheoHocKi1,
  
  hienThiLopChuaCoDiemVaChuaDenThoiGianBatDau,
  dieuChinhDangKiMonHoc,//đã fix

  hienThiLopTinChiChuaDangKi,
  hienThiLopTinChiDaDangKi,
  dangKiLopTinChi, //đã fix
  dangKi1LopTinChi,
  huyDangKiLopTinChi, //đã fix
  huyDangKi1LopTinChi
};