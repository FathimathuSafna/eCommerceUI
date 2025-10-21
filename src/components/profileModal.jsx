import React, { useState, useEffect } from 'react';
import { getMyProfile, updateUser } from '../services/userApi'; 
import {
  Box,
  Modal,
  Typography,
  Button,
  Divider,
  CircularProgress,
  TextField,
  IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const ProfileModal = ({ open, handleClose, handleLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    pincode: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 

      try {
        setLoading(true);
        const response = await getMyProfile();
        setUser(response.data);
        setFormData({
          address: response.data.address || '',
          pincode: response.data.pincode || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile.", err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUserProfile();
      setIsEditing(false);
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user?._id) {
      alert("User ID not found. Please refresh and try again.");
      return;
    }

    try {
      setSaving(true);
      const response = await updateUser(user._id, formData);
      // Update the local user state with the response data
      setUser(prevUser => ({
        ...prevUser,
        address: response.data?.address || formData.address,
        pincode: response.data?.pincode || formData.pincode
      }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile.", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      address: user?.address || '',
      pincode: user?.pincode || ''
    });
    setIsEditing(false);
  };

  const onLogoutClick = () => {
    handleLogout();
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            My Profile
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 1, textAlign: 'left' }}>
              <strong>Name:</strong> {user?.fullName || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, textAlign: 'left' }}>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
              <strong>Phone:</strong> {user?.phoneNumber || 'N/A'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Address Details
              </Typography>
              {!isEditing && (
                <IconButton 
                  onClick={() => setIsEditing(true)} 
                  size="small"
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {isEditing ? (
              <>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  placeholder="Enter your full address"
                />
                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  type="number"
                  sx={{ mb: 2 }}
                  placeholder="Enter pincode"
                />
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', color: 'text.secondary' }}>
                  <strong>Address:</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'left', pl: 1 }}>
                  {user?.address || 'No address added'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
                  <strong>Pincode:</strong> {user?.pincode || 'Not specified'}
                </Typography>
              </>
            )}

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