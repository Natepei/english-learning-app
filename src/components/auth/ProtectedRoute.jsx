import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    console.log("AdminRoute - User:", user);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
};