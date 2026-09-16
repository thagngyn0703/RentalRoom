import { useState } from "react";
import "./LoginPage.css";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../services/api/authApi";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
          <Link to="/" className="auth-brand">trọ chung.</Link>
          <h1 className="login-heading">Chào bạn trở lại.</h1>
          <p className="login-subtext">
            Tiếp tục hành trình tìm nơi ở dành riêng cho bạn.
          </p>

          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              autoComplete="username"
              type="email"
              placeholder="example@gmail.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label htmlFor="login-password">Mật khẩu</label>
            <div className="password-input">
              <input
                id="login-password"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
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
        <div className="login-right auth-art">
          <img src="/images/home-interior.webp" alt="Không gian sống minh họa" />
          <div className="auth-art-caption"><span>NƠI Ở MỚI. CÂU CHUYỆN MỚI.</span><h2>Chốn riêng để<br />bạn là chính mình.</h2><small>Ảnh minh họa</small></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
