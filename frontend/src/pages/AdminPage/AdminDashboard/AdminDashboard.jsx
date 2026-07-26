import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        <li>
          <Link to="/admin/bookings">Quản lý đặt phòng</Link>
        </li>
        {/* Thêm các link admin khác nếu cần */}
      </ul>
    </div>
  );
};

export default AdminDashboard;