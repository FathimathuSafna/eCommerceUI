import React from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
};

const ProfileModal = ({ open, handleClose, user, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    handleClose();
    navigate("/"); // redirect to home
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
        >
          Profile
        </Typography>

        {/* User Details */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Name:</strong> {user?.fullName || "Guest"}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Email:</strong> {user?.email || "Not available"}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Phone:</strong> {user?.phoneNumber || "Not available"}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Logout Button */}
        <Button
          variant="contained"
          color="error"
          fullWidth
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Modal>
  );
};

export default ProfileModal;
