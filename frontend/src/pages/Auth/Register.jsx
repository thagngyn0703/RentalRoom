import React, { useState } from "react";
import {
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "../../config/axios";
import registerImg from "../../assets/anh_login.jpg";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!values.agree) return setError("Vui lòng đồng ý điều khoản.");
    if (values.password !== values.confirmPassword)
      return setError("Mật khẩu không trùng khớp.");

    try {
      setLoading(true);
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      };
      const res = await axios.post("/api/auth/register-start", payload);
      if (res?.data?.success)
        navigate(`/verify?email=${encodeURIComponent(values.email.trim())}`);
      else setError(res?.data?.error || "Đăng ký thất bại");
    } catch (err) {
      setError(err?.response?.data?.error || "Lỗi máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        {/* Ảnh minh họa bên trái */}
        <div className="register-left">
          <img src={registerImg} alt="Register Illustration" />
        </div>

        {/* Form bên phải */}
        <div className="register-right">
          <div className="register-logo">Your Logo</div>
          <h2 className="register-title">Đăng ký</h2>
          <p className="register-subtitle">
            Hãy để bạn có được tất cả các đặc quyền để truy cập vào tài khoản cá nhân của mình.
          </p>

          <form className="register-form" onSubmit={onSubmit}>
            <div className="name-fields">
              <TextField
                fullWidth
                name="firstName"
                label="First name"
                placeholder="John"
                variant="outlined"
                size="small"
                value={values.firstName}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                name="lastName"
                label="Last name"
                placeholder="Doe"
                variant="outlined"
                size="small"
                value={values.lastName}
                onChange={handleChange}
              />
            </div>

            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              placeholder="john.doe@gmail.com"
              variant="outlined"
              size="small"
              value={values.email}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              name="phone"
              label="Số điện thoại"
              placeholder="0123456789"
              variant="outlined"
              size="small"
              value={values.phone}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPwd ? "text" : "password"}
              variant="outlined"
              size="small"
              value={values.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              type={showPwd2 ? "text" : "password"}
              variant="outlined"
              size="small"
              value={values.confirmPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd2(!showPwd2)}>
                      {showPwd2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <div className="terms-container">
              <Checkbox
                size="small"
                name="agree"
                checked={values.agree}
                onChange={handleChange}
              />
              <span>
                Tôi đồng ý với tất cả các{" "}
                <a href="#">điều khoản và chính sách bảo mật</a>
              </span>
            </div>

            {error && <p className="error-text">{error}</p>}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              className="register-btn"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>

            <Typography variant="body2" align="center" className="login-link">
              Đã có tài khoản?{" "}
              <Link href="/login" underline="hover" sx={{ color: "#2b6fe8" }}>
                Đăng nhập
              </Link>
            </Typography>

            <div className="divider">
              <span>Hoặc đăng ký với</span>
            </div>

            <div className="social-login">
              <button className="social-btn" type="button">
                <FaFacebookF size={20} style={{ color: "#1877f2" }} />
              </button>
              <button className="social-btn" type="button">
                <FcGoogle size={22} />
              </button>
              <button className="social-btn" type="button">
                <FaApple size={22} style={{ color: "black" }} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
