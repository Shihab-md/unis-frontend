import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import Swal from 'sweetalert2';
import { getSpinner } from './CommonHelper';

const RoleBaseRoutes = ({ children, requiredRole }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return getSpinner();
    }

    if (!requiredRole.includes(user.role)) {
       // Swal.fire('Error!', 'Authorization Failed!', 'error');
        <Navigate to="/login" />
    }

    return user ? children : <Navigate to="/login" />
}

export default RoleBaseRoutes