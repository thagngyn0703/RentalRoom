import { useState } from "react";
import "./LoginPage.css";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../services/api/authApi";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import secureImg from "../../assets/anh_login.jpg"; // thay bằng ảnh bạn gửi

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); //  trạng thái ẩn/hiện
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clearInput = () => {
    setUsername("");
    setPassword("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const newUser = { username, password };
    loginUser(newUser, dispatch, navigate);
    clearInput();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Cột bên trái */}
        <div className="login-left">
          <div className="logo">Your Logo</div>
          <h2 className="login-heading">Đăng nhập</h2>
          <p className="login-subtext">
            Đăng nhập để truy cập tài khoản của bạn
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label>Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label>Password</label>
            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" /> Nhớ mật khẩu của tôi
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu
              </Link>
            </div>

            <button type="submit" className="login-btn">
              Đăng nhập
            </button>

            <p className="register-text">
              Không có tài khoản?
              <Link to="/register" className="register-link">
                {" "}
                Đăng ký
              </Link>
            </p>
          </form>

        </div>

        {/* Cột bên phải */}
        <div className="login-right">
          <img src={secureImg} alt="secure login" />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
