import React, { useState, useEffect } from 'react';
import './ImageCarousel.css';

const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [animationDirection, setAnimationDirection] = useState(''); // new state

    const slides = [
        {
            url: "https://hocieltsdanang.edu.vn/wp-content/uploads/2021/09/10-website-luyen-thi-ielts-online-5-1400x788.jpg",
            title: "Luyện Đề Online Không Giới Hạn",
            description: "Kho đề thi phong phú với hơn 3000+ đề thi",
            features: [
                "Kho đề phong phú: IELTS, TOEIC, HSK, TOPIK, THPT...",
                "Giao diện giống thi thật, thân thiện với người dùng",
                "Tự chọn part và thời gian làm theo nhu cầu",
                "Đa dạng công cụ: highlight, ghi chú, từ điển...",
                "Report điểm tự động + đánh giá chi tiết bài làm"
            ],
            link: "/courses",
        },
        {
            url: "https://i0.wp.com/apeejay.news/wp-content/uploads/2023/04/shutterstock_1788327221a.jpg?fit=1111%2C602&ssl=1",
            title: "Từ Vựng Phong Phú",
            description: "Học từ vựng mỗi ngày trong từ điển với phát âm chuẩn",
            features: [
                "3000+ từ vựng theo chủ đề",
                "Phát âm chuẩn bản xứ",
                "Ví dụ và giải thích chi tiết",
                "Hệ thống ôn tập thông minh",
                "Tracking tiến độ học tập"
            ],
            link: "/wordlist",
        },
        {
            url: "https://i0.wp.com/speechisbeautiful.com/wp-content/uploads/2016/03/teded.jpg",
            title: "Video Ted phong phú",
            description: "Coi video TED mỗi ngày để cải thiện kỹ năng nghe",
            features: [
                "Kho video TED đa dạng",
                "Phong phú theo từng chủ đề",
                "Có dịch thuật hỗ trợ với người dùng",
                "Dễ dàng theo dõi và ghi chú",
                "Thân thiện với người dùng"
            ],
            link: "/ted-videos",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            handleNextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleNextSlide = () => {
        setAnimationDirection('slide-left'); // slide to the left
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
            setAnimationDirection('');
        }, 500); // Match animation duration
    };

    const handlePrevSlide = () => {
        setAnimationDirection('slide-right'); // slide to the right
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
            setAnimationDirection('');
        }, 500);
    };

    return (
        <div className="carousel-container">
            <a
                href={slides[currentIndex].link} // Thêm thuộc tính href từ slide hiện tại
                className="carousel-slide-link"
                target="_self" // Mở trong cùng tab (có thể dùng "_blank" để mở tab mới)
                rel="noopener noreferrer" // Bảo mật khi dùng "_blank"
            >
                <div
                    className={`carousel-slide ${animationDirection}`}
                    style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
                >
                    <div className="carousel-overlay">
                        <h2>{slides[currentIndex].title}</h2>
                        <p>{slides[currentIndex].description}</p>
                        <div className="feature-list">
                            {slides[currentIndex].features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </a>
            <div className="carousel-navigation">
                <button className="carousel-btn prev" onClick={handlePrevSlide}>
                    &#10094;
                </button>
                <button className="carousel-btn next" onClick={handleNextSlide}>
                    &#10095;
                </button>
            </div>
            <div className="carousel-dots">
                {slides.map((_, index) => (
                    <span
                        key={index}
                        className={`dot ${currentIndex === index ? "active" : ""}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>

    );
};

export default ImageCarousel;
