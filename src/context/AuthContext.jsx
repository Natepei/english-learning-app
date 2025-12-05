import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        if (!userData || !userData.token) {
            console.error("Lỗi: Không có token trong dữ liệu đăng nhập");
            return;
        }

        const userToSave = {
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role, // Lưu role để không bị mất
            token: userData.token,
        };

        localStorage.setItem("user", JSON.stringify(userToSave));
        localStorage.setItem("token", userData.token);
        setUser(userToSave);
    };

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
