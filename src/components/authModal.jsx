import React, { useState } from "react";
import { Box, Modal, Typography, TextField, Button, Link } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { login, signup } from "../services/userApi.js";

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

const AuthModal = ({ open, handleClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Validation Schema ---
  const validationSchema = Yup.object({
    fullName: isLogin
      ? Yup.string()
      : Yup.string().required("Full Name is required"),
    email: Yup.string()
      .email("Enter a valid email")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password should be at least 6 characters")
      .required("Password is required"),
    phoneNumber: isLogin
      ? Yup.string()
      : Yup.string()
          .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
          .required("Phone number is required"),
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setApiError("");
      try {
        if (isLogin) {
          await login({ email: values.email, password: values.password });
        } else {
          await signup({
            fullName: values.fullName,
            email: values.email,
            password: values.password,
            phoneNumber: values.phoneNumber,
          });
        }
        handleClose();
      } catch (error) {
        setApiError(error.response?.data?.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    },
  });

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    formik.resetForm();
    setApiError("");
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

        {apiError && (
          <Typography color="error" sx={{ mb: 1, textAlign: "center" }}>
            {apiError}
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
            disabled={loading}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          {isLogin ? "Don’t have an account? " : "Already have an account? "}
          <Link component="button" variant="body2" onClick={toggleAuthMode}>
            {isLogin ? "Sign Up" : "Login"}
          </Link>
        </Typography>
      </Box>
    </Modal>
  );
};

export default AuthModal;
