import React, { useState, useEffect } from 'react';
import { getMyProfile } from '../services/userApi'; 
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  CircularProgress
} from "@mui/material";

// Style for the modal box
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  textAlign: "center",
};

// The component now accepts the necessary props to function as a modal
const ProfileModal = ({ open, handleClose, handleLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 

      try {
        setLoading(true);
        const response = await getMyProfile();
        setUser(response.data);
      } catch (err) {
        console.error("Failed to fetch profile.", err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data when the modal is told to open
    if (open) {
        fetchUserProfile();
    }
  }, [open]); // This effect now correctly depends on the 'open' prop

  const onLogoutClick = () => {
    handleLogout();
    handleClose(); // Also close the modal
  }

  return (
    // The content is now wrapped in the MUI Modal component
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          My Profile
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 1, textAlign: 'left' }}>
              <strong>Name:</strong> {user?.fullName || '...'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
              <strong>Email:</strong> {user?.email || '...'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onLogoutClick}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ProfileModal;