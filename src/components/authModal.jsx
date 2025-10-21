// Updated AuthModal with Cart Sync and Dashboard Refresh
import React, { useState } from "react";
import { Box, Modal, Typography, TextField, Button, Link } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login, signup } from "../services/userApi.js";
import { syncCartWithDB } from "../services/cartAPI";
import { getLocalCart, clearLocalCart } from "../utils/cartUtils";
import { toast } from "react-toastify";

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

export const AuthModal = ({ open, handleClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [apiMessage, setApiMessage] = useState({ text: "", type: "" });

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password should be at least 6 characters")
      .required("Password is required"),
    fullName: Yup.string().when([], {
      is: () => !isLogin,
      then: (schema) => schema.required("Full Name is required"),
    }),
    phoneNumber: Yup.string().when([], {
      is: () => !isLogin,
      then: (schema) =>
        schema
          .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
          .required("Phone number is required"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setApiMessage({ text: "", type: "" });

      try {
        let response;
        if (isLogin) {
          // --- Login Flow with Cart Sync ---
          response = await login({
            email: values.email,
            password: values.password,
          });

          if (response && response.data) {
            // Save the token
            localStorage.setItem("token", response.data);

            // Get localStorage cart
            const localCart = getLocalCart();

            // Sync cart with database if there are items
            if (localCart && localCart.length > 0) {
              try {
                await syncCartWithDB(localCart);
                
                // Clear localStorage cart after successful sync
                clearLocalCart();
                
                toast.success(
                  `Login successful! Your ${localCart.length} cart items have been synced!`,
                  {
                    position: "top-right",
                    autoClose: 3000,
                  }
                );
              } catch (syncError) {
                console.error("Cart sync failed:", syncError);
                toast.warning("Login successful, but cart sync failed. Please check your cart.", {
                  position: "top-right",
                  autoClose: 4000,
                });
              }
            } else {
              toast.success("Login successful! Welcome back!", {
                position: "top-right",
                autoClose: 2000,
              });
            }

            // ✅ Close modal first
            handleClose();
            
            // ✅ Call onAuthSuccess if provided
            if (onAuthSuccess) {
              onAuthSuccess();
            }
            
            // ✅ Refresh the page to reload dashboard with logged-in state
            setTimeout(() => {
              window.location.reload();
            }, 500);
            
          } else {
            setApiMessage({
              text: response.msg || "Login failed: Invalid credentials.",
              type: "error",
            });
          }
        } else {
          // --- Signup Flow ---
          response = await signup({
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            phoneNumber: values.phoneNumber,
          });

          if (response && response.msg) {
            setApiMessage({
              text: response.msg + " Please login.",
              type: "success",
            });
            resetForm();
            setIsLogin(true);
          } else {
            setApiMessage({
              text: "Signup failed: Invalid response from server.",
              type: "error",
            });
          }
        }
      } catch (error) {
        setApiMessage({
          text: error.response?.msg || "An error occurred.",
          type: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    formik.resetForm();
    setApiMessage({ text: "", type: "" });
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
        >
          {isLogin ? "Login" : "Sign Up"}
        </Typography>

        {apiMessage.text && (
          <Typography
            sx={{
              mb: 1,
              textAlign: "center",
              color:
                apiMessage.type === "error" ? "error.main" : "success.main",
            }}
          >
            {apiMessage.text}
          </Typography>
        )}

        <form onSubmit={formik.handleSubmit}>
          {!isLogin && (
            <>
              <TextField
                fullWidth
                id="fullName"
                name="fullName"
                label="Full Name"
                margin="normal"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.fullName && Boolean(formik.errors.fullName)
                }
                helperText={formik.touched.fullName && formik.errors.fullName}
              />
              <TextField
                fullWidth
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number"
                margin="normal"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.phoneNumber &&
                  Boolean(formik.errors.phoneNumber)
                }
                helperText={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                }
              />
            </>
          )}

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            sx={{ mt: 2 }}
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link component="button" variant="body2" onClick={toggleAuthMode}>
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </Typography>
      </Box>
    </Modal>
  );
};