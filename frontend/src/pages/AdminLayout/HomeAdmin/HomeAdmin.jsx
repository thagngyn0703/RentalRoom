import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, deleteUser } from "../../../services/api/userApi";
import { clearMessage } from "../../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../Components/ConfirmProvider";

const HomeAdmin = () => {
  const { confirm } = useConfirm();

  const dispatch = useDispatch();
  const { allUser, isFetching, error } = useSelector(state => state?.user?.users || { allUser: null, isFetching: false, error: false });
  const message = useSelector(state => state?.user?.message || { text: "", type: "" });
  const accessToken = useSelector(state => state?.auth?.login?.accessToken || "");
  const currentUser = useSelector(state => state?.auth?.login?.currentUser || null);
  const navigate = useNavigate();

  // Fetch users khi component mount
  useEffect(() => {
    console.log("🔍 useEffect triggered:");
    console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
    console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
    
    if(!currentUser) {
      console.log(" Redirecting to login: no currentUser");
      navigate('/login');
      return;
    }
    
    if (currentUser) {
      console.log("👥 Fetching users...");
      getAllUsers(dispatch).catch(error => {
        // Ignore AUTH_FAILED errors since we already redirected
        if (error.message !== 'AUTH_FAILED') {
          console.error("❌ Error fetching users:", error);
        }
      });
    } else {
      console.log("⚠️ No currentUser, skipping user fetch");
    }
  }, [accessToken, dispatch, currentUser, navigate]);

  // Auto clear message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        dispatch(clearMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message.text, dispatch]);

  const handleDeleteUser = async (userId) => {
    const ok = await confirm("Are you sure you want to delete this user?");
    if (ok) {
      try {
        console.log("🗑️ Deleting user with ID:", userId);
        console.log("🔑 Current state before delete:");
        console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
        console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
        
        await deleteUser(userId, dispatch);
        console.log("✅ Delete successful, refreshing user list...");
        
        console.log("🔑 Current state after delete:");
        console.log("- accessToken:", accessToken ? "EXISTS" : "NULL");
        console.log("- currentUser:", currentUser ? "EXISTS" : "NULL");
        
        // Refresh user list after successful delete
        getAllUsers(dispatch).catch(error => {
          if (error.message !== 'AUTH_FAILED') {
            console.error("❌ Error refreshing user list:", error);
          }
        });
      } catch (error) {
        if (error.message !== 'AUTH_FAILED') {
          console.error("❌ Failed to delete user:", error);
        }
      }
    }
  };

  if (isFetching) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Error loading users</h2>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h1>User List</h1>
      
      {/* Display message */}
      {message.text && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          {message.text}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allUser && allUser.length > 0 ? (
          allUser.map((user) => (
            <div key={user._id} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'white'
            }}>
              <div>
                <div><strong>Username:</strong> {user.username}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Role:</strong> {user.role || 'user'}</div>
              </div>
              <button 
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
                onClick={() => handleDeleteUser(user._id)}
              > 
                Delete 
              </button>
            </div>
          ))
        ) : (
          <div>No users found</div>
        )}
      </div>
    </div>
  );
};

export default HomeAdmin;