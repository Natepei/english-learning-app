import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WordSearch from './WordSearch';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();
    console.log('User in navbar:', user);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        English Learning
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="navbar-center">
                    <ul className="navbar-menu">
                        <li><Link to="/">Trang Chủ</Link></li>
                        <li><Link to="/courses">Khóa học</Link></li>
                        <li><Link to="/wordlist">Từ vựng</Link></li>
                        <li><Link to="/ted-videos">TED Videos</Link></li>
                        <li><Link to="/grammarly">Ngữ pháp</Link></li>
                        <li><Link to="/blogs">Blog</Link></li>
                        <li><Link to="/toeic">📚 TOEIC</Link></li>
                        {user && user.role === 'admin' && (
                            <li><Link to="/dashboard">Quản Trị</Link></li>
                        )}
                        {!user ? (
                            <>
                                <li><Link to="/login">Đăng Nhập</Link></li>
                                <li><Link to="/register">Đăng Ký</Link></li>
                            </>
                        ) : (
                            <li className="user-menu">
                                <span className="user-name">
                                    {user.username}
                                    {user.role === 'admin' && ' (Admin)'}
                                </span>
                                <ul className="dropdown-menu">
                                    <li><Link to="/profile">Thông tin cá nhân</Link></li>
                                    <li><Link to="/toeic/history">Lịch sử TOEIC</Link></li>
                                    <li><button onClick={logout}>Đăng xuất</button></li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>

                <div className="navbar-right">
                    <WordSearch />
                    <div className="hamburger-icon" onClick={toggleMenu}>
                        ☰
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <ul className="mobile-menu-list">
                    <li><Link to="/">Trang Chủ</Link></li>
                    <li><Link to="/courses">Khóa học</Link></li>
                    <li><Link to="/wordlist">Từ vựng</Link></li>
                    <li><Link to="/ted-videos">TED Videos</Link></li>
                    <li><Link to="/grammarly">Ngữ pháp</Link></li>
                    <li><Link to="/blogs">Blog</Link></li>
                    <li><Link to="/toeic">📚 TOEIC Test</Link></li>
                    {user && user.role === 'admin' && (
                        <li><Link to="/dashboard">Quản Trị</Link></li>
                    )}
                    {!user ? (
                        <>
                            <li><Link to="/login">Đăng Nhập</Link></li>
                            <li><Link to="/register">Đăng Ký</Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/profile">Thông tin cá nhân</Link></li>
                            <li><Link to="/toeic/history">Lịch sử TOEIC</Link></li>
                            <li><button onClick={logout} className="mobile-logout-btn">Đăng xuất</button></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;