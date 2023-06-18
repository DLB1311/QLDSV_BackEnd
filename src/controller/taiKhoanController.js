const Database  = require("../config/database");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = Database.getInstance();    
pool.connect();

let dangNhap = async (req, res) => {
  const { TenTaiKhoan, MatKhau } = req.body;

  if (!TenTaiKhoan || !MatKhau) {
    res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không được để trống' });
    return;
  }

  try {
    const query = `SELECT * FROM dbo.TaiKhoan WHERE TenTaiKhoan = '${TenTaiKhoan}'`;
    const result = await pool.executeQuery(query);

    if (result.length > 0) {
      const { MaTk, MatKhau: hashedPassword, MaVaitro, Active } = result[0]; // Lấy MaTk, mật khẩu đã được mã hóa và trạng thái từ kết quả truy vấn

      if (Active) {
        // So sánh mật khẩu đã mã hóa với mật khẩu người dùng nhập vào
        const passwordMatched = await bcrypt.compare(MatKhau, hashedPassword);

        if (passwordMatched) {
          // Tạo token JWT với MaTk
          const token = jwt.sign({ MaTk, MaVaitro }, "jwt_secret_key");

          res.status(200).json({
            MaTk,
            TenTaiKhoan,
            MatKhau: hashedPassword,
            MaVaitro,
            token,
          });
        } else {
          res.status(401).json({ error: 'Mật khẩu không trùng khớp với hệ thống' });
        }
      } else {
        res.status(401).json({ error: 'Tài khoản đã bị vô hiệu hóa' });
      }
    } else {
      res.status(401).json({ error: 'Tài khoản này chưa được tạo' });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

let doiMatKhau = async (req, res) => {
    try {
      // Lấy thông tin tài khoản từ token
      const { MaTk } = await auth.getUserIdFromToken(req);
  
      if (!MaTk) {
        res.status(401).json({ error: 'Token không hợp lệ' });
        return;
      }
  
      const { MatKhauCu, MatKhauMoi } = req.body;
  
      // Lấy thông tin tài khoản từ MaTk
      const getTaiKhoanQuery = `SELECT * FROM dbo.TaiKhoan WHERE MaTk = '${MaTk}'`;
      const taiKhoanResult = await pool.executeQuery(getTaiKhoanQuery);
  
      if (taiKhoanResult.length > 0) {
        const { MatKhau: hashedPassword } = taiKhoanResult[0]; // Lấy mật khẩu đã được mã hóa từ kết quả truy vấn
  
        // So sánh mật khẩu cũ đã mã hóa với mật khẩu cũ người dùng nhập vào
        const passwordMatched = await bcrypt.compare(MatKhauCu, hashedPassword);
  
        if (passwordMatched) {
          // Băm mật khẩu mới
          const hashedNewPassword = await bcrypt.hash(MatKhauMoi, 10);
  
          // Cập nhật mật khẩu mới vào cơ sở dữ liệu
          const updateMatKhauQuery = `UPDATE dbo.TaiKhoan SET MatKhau = '${hashedNewPassword}' WHERE MaTk = '${MaTk}'`;
          await pool.executeQuery(updateMatKhauQuery);
  
          res.status(200).json({ success: true, message: 'Đổi mật khẩu thành công' });
        } else {
          res.status(401).json({ error: 'Mật khẩu cũ không chính xác' });
        }
      } else {
        res.status(404).json({ error: 'Không tìm thấy tài khoản' });
      }
    } catch (error) {
      console.log('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  
module.exports = {
    dangNhap,
    doiMatKhau
};
