import React from 'react';
import { Navigate } from 'react-router-dom';

// Halaman Achievements telah dihapus sesuai permintaan pengguna
export default function Achievements() {
  return <Navigate to="/" replace />;
}
