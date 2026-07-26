import React, { useMemo, useState, useEffect } from "react";
import {  Link, TextField, Typography } from "@mui/material";
import axios from "../../config/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/slices/authSlice";
import "./Verify.css";
import verifyImg from "../../assets/anh_login.jpg";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Verify() {
  const q = useQuery();
  const email = q.get("email") || "";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(600); // 10 phút
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-code", { email, code });
      if (res?.data?.success) {

        const { accessToken, refreshToken, user } = res.data.data;
        dispatch(setCredentials({ accessToken, refreshToken, user }));
        navigate("/login");
      } else {
        setError(res?.data?.error || "Xác minh thất bại");
      }
    } catch (err) {
      if (err?.response?.status === 410)
        setError("Mã đã hết hạn. Vui lòng đăng ký lại.");
      else setError(err?.response?.data?.error || "Lỗi máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown) return;
    setError("");
    setInfo("");
    try {
      const res = await axios.post("/api/auth/resend-code", { email });
      if (res?.data?.success) {
        setInfo("Đã gửi lại mã.");
        setCooldown(600);
      } else {
        setError(res?.data?.error || "Không gửi lại được mã.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Lỗi máy chủ");
    }
  };

  const minutes = Math.floor(cooldown / 60);
  const seconds = cooldown % 60;

  return (
    <div className="verify-page">
      <div className="verify-card">
        {/* Cột trái: nội dung */}
        <div className="verify-left">
          <Link href="/login" underline="hover" className="back-link">
            ← Quay lại đăng nhập
          </Link>

          <h2 className="verify-title">Mã xác minh</h2>
          <p className="verify-desc">
            Một mã xác thực đã được gửi đến email của bạn:{" "}
            <b>{email}</b>
          </p>

          <form onSubmit={submit}>
            <TextField
              label="Nhập mã"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              inputProps={{
                maxLength: 8,
                style: { letterSpacing: 4, fontWeight: 700 },
              }}
              fullWidth
              required
            />

            {error && <Typography color="error">{error}</Typography>}
            {info && <Typography color="primary">{info}</Typography>}

            <p className="resend">
              Không nhận được mã?{" "}
              <button
                type="button"
                className="resend-btn"
                onClick={resend}
                disabled={!!cooldown}
              >
                {cooldown
                  ? `Gửi lại sau ${minutes}m ${seconds}s`
                  : "Gửi lại"}
              </button>
            </p>

            <button type="submit" className="verify-btn" disabled={loading}>
              {loading ? "Đang xác minh..." : "Xác nhận"}
            </button>
          </form>
        </div>

        {/* Cột phải: hình minh họa */}
        <div className="verify-right">
          <img src={verifyImg} alt="verify" />

        </div>
      </div>
    </div>
  );
}
