import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Auth.css';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth(); // Gọi hàm login từ AuthContext

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            const userData = response.data;

            // Lưu thông tin người dùng vào context
            login(userData);

            // Điều hướng đến trang profile
            navigate('/profile');
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Đăng Nhập</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-input"
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                            required
                        />
                    </div>
                    {error && <div className="auth-error">{error}</div>}
                    <button type="submit" className="auth-button">
                        Đăng Nhập
                    </button>
                </form>
                <Link to="/register" className="auth-link">
                    Chưa có tài khoản? Đăng ký ngay
                </Link>
            </div>
        </div>
    );
}

export default Login;
