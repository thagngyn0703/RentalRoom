import React from "react";
import "./App.css";
// Auth pages share global selectors; preserve their cascade across lazy navigation.
import "./pages/LoginPage/LoginPage.css";
import "./pages/Auth/Register.css";
import "./config/axios";
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
// RegisterPage import removed (unused)
import NavBar from "./Components/NavBar/NavBar";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
// Layouts

// Pages
import HomeLanding from "./pages/HomeLanding/HomeLanding";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import theme from "./theme/theme";

import Footer from "./Components/Footer/Footer";
// eslint-disable-next-line no-unused-vars -- used in Route path="users"
import RoomSearchChatbot from "./Components/RoomSearchChatbot/RoomSearchChatbot";
import { ToastProvider } from "./Components/ToastProvider";
import ConfirmProvider from "./Components/ConfirmProvider";

const HomeAdmin = React.lazy(() => import('./pages/AdminLayout/HomeAdmin/HomeAdmin'));
const HomePageUser = React.lazy(() => import('./pages/HomePageUser/HomePageUser'));
const LoginPage = React.lazy(() => import('./pages/LoginPage/LoginPage'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Verify = React.lazy(() => import('./pages/Auth/Verify'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'));
const VerifyCode = React.lazy(() => import('./pages/Auth/VerifyCode'));
const AdminLayout = React.lazy(() => import('./pages/AdminLayout/AdminLayout'));
const UserLayout = React.lazy(() => import('./pages/UserLayout/UserLayout'));
const UserInfoForms = React.lazy(() => import('./pages/UserLayout/UserInfoForm'));
const InviteroomatePages = React.lazy(() => import('./pages/UserLayout/InviteRoomatePages'));
const Paying = React.lazy(() => import('./pages/UserLayout/Paying'));
const RentRoomCheckout = React.lazy(() => import('./pages/UserLayout/RentRoomCheckout'));
const TopupHistory = React.lazy(() => import('./pages/UserLayout/TopupHistory/TopupHistory'));
const Pricing = React.lazy(() => import('./pages/UserLayout/Pricing/Pricing'));
const IsLandorStatus = React.lazy(() => import('./pages/UserLayout/IsLandorStatus'));
const SupportPage = React.lazy(() => import('./pages/UserLayout/Support'));
const RoomsPage = React.lazy(() => import('./pages/RoomsPage/RoomsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage/FavoritesPage'));
const RoomDetailPage = React.lazy(() => import('./pages/RoomDetailPage/RoomDetailPage'));
const RoomReviewsPage = React.lazy(() => import('./pages/RoomReviewsPage/RoomReviewsPage'));
const PostRoomPages = React.lazy(() => import('./pages/UserLayout/PostRoomPages'));
const AdminBookings = React.lazy(() => import('./pages/AdminPage/AdminBookings/AdminBookings'));
const AdminCheckout = React.lazy(() => import('./pages/AdminPage/AdminCheckout/AdminCheckout'));
const AdminDeposits = React.lazy(() => import('./pages/AdminPage/AdminDeposits/AdminDeposits'));
const AdminEarlyCheckout = React.lazy(() => import('./pages/AdminPage/AdminEarlyCheckout/AdminEarlyCheckout'));
const AdminDashboard = React.lazy(() => import('./pages/AdminPage/AdminDashboard/AdminDashboard'));
const AdminPosts = React.lazy(() => import('./pages/AdminLayout/AdminPosts/AdminPosts'));
const AdminUsers = React.lazy(() => import('./pages/AdminLayout/AdminUsers/AdminUsers'));
const AdminSupport = React.lazy(() => import('./pages/AdminLayout/AdminSupport/AdminSupport'));
const ManageRoomUser = React.lazy(() => import('./pages/UserLayout/ManageRoomUser/ManageRoomUser'));
const ManagePostUser = React.lazy(() => import('./pages/UserLayout/ManagePostUser'));
const MyRentals = React.lazy(() => import('./pages/UserLayout/MyRentals'));
const RentalDetail = React.lazy(() => import('./pages/UserLayout/RentalDetail/RentalDetail'));
const OwnerCheckoutRequests = React.lazy(() => import('./pages/UserLayout/OwnerCheckoutRequests'));
const OwnerExtendRequests = React.lazy(() => import('./pages/UserLayout/OwnerExtendRequests'));
const OwnerPaymentHistory = React.lazy(() => import('./pages/UserLayout/OwnerPaymentHistory'));
const Withdraw = React.lazy(() => import('./pages/UserLayout/Withdraw/Withdraw'));
const WithdrawalHistory = React.lazy(() => import('./pages/UserLayout/WithdrawalHistory/WithdrawalHistory'));
const AdminWithdrawals = React.lazy(() => import('./pages/AdminPage/AdminWithdrawals/AdminWithdrawals'));
const PostEdit = React.lazy(() => import('./pages/PostEdit/PostEdit'));
const InviteDetail = React.lazy(() => import('./pages/InviteDetail/InviteDetail'));
const NoPermission = React.lazy(() => import('./pages/NoPermission'));
const AboutPage = React.lazy(() => import('./pages/AboutPage/AboutPage'));
const ChatInboxPage = React.lazy(() => import('./pages/ChatInboxPage/ChatInboxPage'));
const NotificationsPage = React.lazy(() => import('./pages/Notifications'));
const DocsPage = React.lazy(() => import('./pages/DocsPage/DocsPage'));

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
        <React.Suspense fallback={<Box role="status" sx={{ p: 4 }}>Đang tải trang…</Box>}>
        <Routes>
          <Route path="/homeadmin" element={<HomeAdmin />} />
          <Route path="/homepage" element={<HomePageUser />} />
          <Route path="/" element={<HomeLanding />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/docs" element={<React.Suspense fallback={<Box role="status" sx={{ p: 4 }}>Đang tải tài liệu…</Box>}><DocsPage /></React.Suspense>} />
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
        </React.Suspense>
      </Box>
      <Footer />
      <RoomSearchChatbot />
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
