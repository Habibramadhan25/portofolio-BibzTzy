import React from 'react';
import { Navigate } from 'react-router-dom';

// Admin Login telah dinonaktifkan sesuai permintaan pengguna
export default function AdminLogin() {
  return <Navigate to="/" replace />;
}
