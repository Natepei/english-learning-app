import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../../assets/vendor/fontawesome-free/css/all.min.css';
import '../../assets/css/sb-admin-2.min.css';
import './Dashboard.css';

const Dashboard = () => {
    const [sidebarToggled, setSidebarToggled] = useState(false);

    const toggleSidebar = () => {
        setSidebarToggled(!sidebarToggled);
    };

    return (
        <div id="wrapper">
            {/* Sidebar */}
            <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion ${sidebarToggled ? 'toggled' : ''}`} id="accordionSidebar">
                {/* Sidebar - Brand */}
                <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/dashboard">
                    <div className="sidebar-brand-icon rotate-n-15">
                        <i className="fas fa-laugh-wink"></i>
                    </div>
                    <div className="sidebar-brand-text mx-3">Admin Panel</div>
                </a>

                {/* Divider */}
                <hr className="sidebar-divider my-0" />

                {/* Nav Item - Dashboard */}
                <li className="nav-item active">
                    <Link className="nav-link" to="/dashboard">
                        <i className="fas fa-fw fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* Heading */}
                <div className="sidebar-heading">
                    Management
                </div>

                {/* Nav Item - Account Management */}
                <li className="nav-item">
                    <Link className="nav-link" to="/dashboard/account-management">
                        <i className="fas fa-fw fa-users"></i>
                        <span>Account Management</span>
                    </Link>
                </li>

                {/* Nav Item - Course Management */}
                <li className="nav-item">
                    <Link className="nav-link" to="/dashboard/courses-management">
                        <i className="fas fa-fw fa-book"></i>
                        <span>Course Management</span>
                    </Link>
                </li>

                {/* Nav Item - Blog Management */}
                <li className="nav-item">
                    <Link className="nav-link" to="/dashboard/blogs-management">
                        <i className="fas fa-fw fa-blog"></i>
                        <span>Blog Management</span>
                    </Link>
                </li>

                {/* Divider */}
                <hr className="sidebar-divider" />

                {/* Heading - TOEIC */}
                <div className="sidebar-heading">
                    TOEIC Management
                </div>

                {/* Nav Item - TOEIC Books */}
                <li className="nav-item">
                    <Link className="nav-link" to="/dashboard/books-management">
                        <i className="fas fa-fw fa-book-open"></i>
                        <span>TOEIC Books</span>
                    </Link>
                </li>

                {/* Sidebar Toggler (Sidebar) */}
                <div className="text-center d-none d-md-inline">
                    <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleSidebar}></button>
                </div>
            </ul>

            {/* Begin Page Content */}
            <div className="container-fluid">
                <p>Dashboard Content</p>
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;