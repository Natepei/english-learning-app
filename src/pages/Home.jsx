import React from 'react';
import { Link } from 'react-router-dom';
import "./Home.css";
import ImageCarousel from '../components/layout/ImageCarousel';
import { BookOpen, Star, Users, Trophy } from 'lucide-react';

const Home = () => {
  return (
    <div className="home-container">
      <ImageCarousel />
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Học Tiếng Anh Mỗi Ngày</h1>
          <p>Hành trình chinh phục tiếng Anh của bạn bắt đầu từ đây</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn primary-btn">
              Bắt Đầu Ngay
            </Link>
            <Link to="/login" className="btn secondary-btn">
              Đăng Nhập
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="features-grid">
          <div className="feature-card">
            <BookOpen className="feature-icon" />
            <h3>Học Mọi Lúc Mọi Nơi</h3>
            <p>Truy cập bài học từ điện thoại hoặc máy tính của bạn</p>
          </div>

          <div className="feature-card">
            <Star className="feature-icon" />
            <h3>Từ Vựng Phong Phú</h3>
            <p>Kho từ vựng đa dạng với phát âm chuẩn</p>
          </div>

          <div className="feature-card">
            <Users className="feature-icon" />
            <h3>Cộng Đồng Hỗ Trợ</h3>
            <p>Học cùng cộng đồng người học tiếng Anh</p>
          </div>

          <div className="feature-card">
            <Trophy className="feature-icon" />
            <h3>Theo Dõi Tiến Độ</h3>
            <p>Xem thống kê học tập chi tiết của bạn</p>
          </div>
        </div>

        {/* Study Methods */}
        <div className="study-methods">
          <h2>Phương Pháp Học Hiệu Quả</h2>
          <div className="methods-grid">
            <div className="method-card">
              <div className="method-number">01</div>
              <h3>Học Theo Chủ Đề</h3>
              <p>Từ vựng được phân loại theo chủ đề giúp dễ nhớ</p>
            </div>
            <div className="method-card">
              <div className="method-number">02</div>
              <h3>Luyện Tập Hàng Ngày</h3>
              <p>Bài tập đa dạng giúp củng cố kiến thức</p>
            </div>
            <div className="method-card">
              <div className="method-number">03</div>
              <h3>Ôn Tập Thông Minh</h3>
              <p>Hệ thống nhắc nhở thông minh giúp bạn không quên từ vựng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;