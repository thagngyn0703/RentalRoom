import React from "react";
import "./App.css";
import "./config/axios";
import { useEffect } from "react";
import HomeAdmin from "./pages/AdminLayout/HomeAdmin/HomeAdmin";
import HomePageUser from "./pages/HomePageUser/HomePageUser";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
// RegisterPage import removed (unused)
import NavBar from "./Components/NavBar/NavBar";
import Register from "./pages/Auth/Register";
import Verify from "./pages/Auth/Verify";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyCode from "./pages/Auth/VerifyCode";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
// Layouts
import AdminLayout from "./pages/AdminLayout/AdminLayout";
import UserLayout from "./pages/UserLayout/UserLayout";

// Pages
import HomeLanding from "./pages/HomeLanding/HomeLanding";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import theme from "./theme/theme";
import UserInfoForms from "./pages/UserLayout/UserInfoForm";
import InviteroomatePages from "./pages/UserLayout/InviteRoomatePages";
import Paying from "./pages/UserLayout/Paying";
import RentRoomCheckout from "./pages/UserLayout/RentRoomCheckout";
import TopupHistory from "./pages/UserLayout/TopupHistory/TopupHistory";
import Pricing from "./pages/UserLayout/Pricing/Pricing";
import IsLandorStatus from "./pages/UserLayout/IsLandorStatus";

import SupportPage from "./pages/UserLayout/Support";
import RoomsPage from "./pages/RoomsPage/RoomsPage";
import FavoritesPage from "./pages/FavoritesPage/FavoritesPage";
import RoomDetailPage from "./pages/RoomDetailPage/RoomDetailPage";
import RoomReviewsPage from "./pages/RoomReviewsPage/RoomReviewsPage";
import Footer from "./Components/Footer/Footer";
import PostRoomPages from "./pages/UserLayout/PostRoomPages";
import AdminBookings from "./pages/AdminPage/AdminBookings/AdminBookings";
import AdminCheckout from "./pages/AdminPage/AdminCheckout/AdminCheckout";
import AdminDeposits from "./pages/AdminPage/AdminDeposits/AdminDeposits";
import AdminEarlyCheckout from "./pages/AdminPage/AdminEarlyCheckout/AdminEarlyCheckout";
import AdminDashboard from "./pages/AdminPage/AdminDashboard/AdminDashboard";
import AdminPosts from "./pages/AdminLayout/AdminPosts/AdminPosts";
// eslint-disable-next-line no-unused-vars -- used in Route path="users"
import AdminUsers from "./pages/AdminLayout/AdminUsers/AdminUsers";
import AdminSupport from "./pages/AdminLayout/AdminSupport/AdminSupport";
import ManageRoomUser from "./pages/UserLayout/ManageRoomUser/ManageRoomUser";
import ManagePostUser from './pages/UserLayout/ManagePostUser';
import MyRentals from './pages/UserLayout/MyRentals';
import RentalDetail from "./pages/UserLayout/RentalDetail/RentalDetail";
import OwnerCheckoutRequests from './pages/UserLayout/OwnerCheckoutRequests';
import OwnerExtendRequests from './pages/UserLayout/OwnerExtendRequests';
import OwnerPaymentHistory from './pages/UserLayout/OwnerPaymentHistory';
import Withdraw from "./pages/UserLayout/Withdraw/Withdraw";
import WithdrawalHistory from "./pages/UserLayout/WithdrawalHistory/WithdrawalHistory";
import AdminWithdrawals from "./pages/AdminPage/AdminWithdrawals/AdminWithdrawals";
import { ToastProvider } from "./Components/ToastProvider";
import ConfirmProvider from "./Components/ConfirmProvider";
import PostEdit from "./pages/PostEdit/PostEdit";
import InviteDetail from "./pages/InviteDetail/InviteDetail";
import NoPermission from "./pages/NoPermission";
import AboutPage from "./pages/AboutPage/AboutPage";
import ChatInboxPage from "./pages/ChatInboxPage/ChatInboxPage";
import NotificationsPage from "./pages/Notifications";

// Component con để sử dụng useLocation hook
function AppContent() {
  const location = useLocation();

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      try {
        window.dispatchEvent(new CustomEvent('app:alert', { detail: message }));
      } catch (_) {
        originalAlert(message);
      }
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Mỗi khi chuyển trang (route) thì cuộn lên đầu để trải nghiệm tốt hơn
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Định nghĩa các route không hiển thị navbar
  const hideNavbarRoutes = [
    "/landlord",
    "/admin",
    "/register",
    "/login",
    "/verify",
    "/forgot-password",
    "/reset-password",
    "/verifycode",
  ];

  // Kiểm tra có nên hiển thị navbar không
  const shouldShowNavbar = !hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {shouldShowNavbar && <NavBar />}
      <Box component="main" sx={{ flex: 1 }}>
        <Routes>
          <Route path="/homeadmin" element={<HomeAdmin />} />
          <Route path="/homepage" element={<HomePageUser />} />
          <Route path="/" element={<HomeLanding />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verifycode" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/rooms" element={<RoomsPage postType="room_rental" />} />
          <Route
            path="/invite-rooms"
            element={<RoomsPage postType="invite roomate" />}
          />
          <Route path="/invite/:id" element={<InviteDetail />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/room/:id" element={<RoomDetailPage />} />

          <Route path="/room/:id/reviews" element={<RoomReviewsPage />} />
          <Route path="/no-permission" element={<NoPermission />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route
              path="bookings"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="checkout"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="deposits"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDeposits />
                </ProtectedRoute>
              }
            />
            <Route
              path="early-checkout"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminEarlyCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="posts"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPosts />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="viewsupport"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminSupport />
                </ProtectedRoute>
              }
            />
            <Route
              path="withdrawals"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminWithdrawals />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* User routes */}

          <Route path="/user" element={<UserLayout />}>
            <Route path="paying/:requirepaying" element={<Paying />} />
            <Route path="paying" element={<Paying />} />
            <Route path="rent-room/:roomId" element={<RentRoomCheckout />} />
            <Route path="topup-history" element={<TopupHistory />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="islandor" element={<IsLandorStatus />} />
            <Route path="edit-post/:postId" element={<PostEdit />} />
            <Route path="profile" element={<UserInfoForms />} />
            <Route path="posts" element={<ManagePostUser />} />
            <Route path="posts/edit/:postId" element={<PostEdit />} />
            <Route path="post-room" element={<PostRoomPages />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="manage-rooms" element={<ManageRoomUser />} />
            <Route path="owner-checkout-requests" element={<OwnerCheckoutRequests />} />
            <Route path="owner-extend-requests" element={<OwnerExtendRequests />} />
            <Route path="owner-payment-history" element={<OwnerPaymentHistory />} />
            <Route path="invite-roommate" element={<InviteroomatePages />} />
            <Route path="chat" element={<ChatInboxPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="my-rentals" element={<MyRentals />} />
            <Route path="my-rentals/booking/:bookingId" element={<RentalDetail />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="withdrawalhistory" element={<WithdrawalHistory />} />
          </Route>
        </Routes>
      </Box>
      <Footer />
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <ToastProvider>
          <ConfirmProvider>
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
