import React from 'react';
import { Navigate } from 'react-router-dom';

// Admin Dashboard telah dinonaktifkan sesuai permintaan pengguna
export default function AdminDashboard() {
  return <Navigate to="/" replace />;
}
