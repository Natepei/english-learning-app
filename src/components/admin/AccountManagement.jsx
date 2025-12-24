import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/api';
import axios from 'axios';
import './AccountManagement.css';

const AccountManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });
    const [editingUser, setEditingUser] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem("token"); // Lấy token từ localStorage

                if (!token) {
                    console.error("Lỗi: Không tìm thấy token.");
                    setError("Không tìm thấy token.");
                    setLoading(false);
                    return;
                }

                const res = await fetch(getApiBaseUrl() + '/auth/users', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Gửi token kèm theo
                    },
                });

                if (!res.ok) {
                    throw new Error(`Lỗi: ${res.status} - ${res.statusText}`);
                }

                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
                setError("Lỗi server hoặc token không hợp lệ.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);



    const handleAddUser = async () => {
        try {
            if (!newUser.password) {
                alert('Vui lòng nhập mật khẩu cho tài khoản mới');
                return;
            }

            const response = await axios.post(
                getApiBaseUrl() + '/auth/users',
                newUser,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setUsers([...users, response.data]);
            setNewUser({ username: '', email: '', password: '', role: '' }); // Reset form
            alert('Tạo tài khoản thành công!');
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm user');
        }
    };

    const handleEditUser = async (id) => {
        try {
            const response = await axios.put(
                `${getApiBaseUrl()}/auth/users/${id}`,
                editingUser,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },

                }
            );
            setUsers(users.map((user) => (user._id === id ? response.data : user)));
            setEditingUser(null);
            alert('Cập nhật tài khoản thành công!');
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi sửa user');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            return;
        }

        try {
            await axios.delete(`${getApiBaseUrl()}/auth/users/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },

            });
            setUsers(users.filter((user) => user._id !== id));
            alert('Xóa tài khoản thành công!');
        } catch (err) {
            alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa user');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="admin-error">Bạn không có quyền truy cập trang này</div>;
    }

    if (loading) return <div className="admin-loading">Đang tải...</div>;
    if (error) return <div className="admin-error">{error}</div>;

    return (
        <div className="admin-container">
            <h1>Quản lý tài khoản</h1>

            {/* Form thêm User */}
            <div className="add-user-form">
                <h2>Thêm tài khoản mới</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                    <option value="">Chọn vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
                <button onClick={handleAddUser}>Thêm</button>
            </div>

            {/* Danh sách User */}
            <div className="admin-users">
                <h2>Danh sách người dùng</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        {editingUser && editingUser._id === user._id ? (
                                            <input
                                                type="text"
                                                value={editingUser.username}
                                                onChange={(e) =>
                                                    setEditingUser({ ...editingUser, username: e.target.value })
                                                }
                                            />
                                        ) : (
                                            user.username
                                        )}
                                    </td>
                                    <td>
                                        {editingUser && editingUser._id === user._id ? (
                                            <input
                                                type="email"
                                                value={editingUser.email}
                                                onChange={(e) =>
                                                    setEditingUser({ ...editingUser, email: e.target.value })
                                                }
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                    <td>
                                        {editingUser && editingUser._id === user._id ? (
                                            <select
                                                value={editingUser.role}
                                                onChange={(e) =>
                                                    setEditingUser({ ...editingUser, role: e.target.value })
                                                }
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : (
                                            user.role
                                        )}
                                    </td>
                                    <td>
                                        {editingUser && editingUser._id === user._id ? (
                                            <>
                                                <button onClick={() => handleEditUser(user._id)}>Lưu</button>
                                                <button onClick={() => setEditingUser(null)}>Hủy</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-primary" onClick={() => setEditingUser(user)}>Sửa</button>
                                                <button className="btn-danger" onClick={() => handleDeleteUser(user._id)}>Xóa</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;