import React from 'react';
import { Link } from 'react-router-dom';
import './GrammarlyPage.css';

const grammarTopics = [
  {
    title: (
      <>
        Thì cơ bản{' '}
        <Link to="/basic-tenses" className="grammar-link">
          (Xem chi tiết)
        </Link>
      </>
    ),
    desc: 'Tập trung vào 12 thì tiếng Anh cơ bản với ví dụ minh họa và giải thích chi tiết.',
  },
  {
    title: (
        <>
            Từ loại{' '}
            <Link to="/parts-of-speech" className="grammar-link">
            (Xem chi tiết)
            </Link>
        </>
    ),
    desc: 'Hiểu các thành phần cơ bản như danh từ, động từ, đại từ, v.v. là nền tảng cho mọi giao tiếp.',
  },
  {
    title: (
        <>
            Cấu trúc câu{' '}
            <Link to="/sentence-structure" className="grammar-link">
                (Xem chi tiết)
            </Link>
        </>
    ),
    desc: 'Biết cách tạo các loại câu: đơn, ghép, phức, ghép-phức với ví dụ minh họa.',
  },
//   {
//     title: 'Danh từ (Nouns)',
//     desc: 'Nhận biết danh từ số ít/số nhiều và sở hữu giúp đặt tên và thể hiện quyền sở hữu.',
//   },
//   {
//     title: 'Động từ (Verbs)',
//     desc: 'Nắm vững động từ chỉ hành động và các thì cơ bản (hiện tại, quá khứ, tương lai) để diễn đạt hành động.',
//   },
//   {
//     title: 'Sự thống nhất giữa chủ ngữ và động từ (Subject-Verb Agreement)',
//     desc: 'Sự phù hợp giữa chủ ngữ và động từ đảm bảo câu có nghĩa.',
//   },
//   {
//     title: 'Dấu câu (Punctuation)',
//     desc: 'Sử dụng dấu chấm, dấu phẩy, dấu hỏi đúng cách giúp câu rõ ràng.',
//   },
//   {
//     title: 'Mạo từ (Articles)',
//     desc: 'Sử dụng đúng "a", "an", "the" giúp dùng danh từ chính xác.',
//   },
//   {
//     title: 'Trật tự từ (Word Order)',
//     desc: 'Tuân theo cấu trúc Chủ ngữ - Động từ - Tân ngữ (SVO) để tạo câu cơ bản.',
//   },
];

const GrammarlyPage = () => (
  <div className="grammarly-page">
    <h1 className="grammarly-title">Tổng Hợp Ngữ Pháp Cơ Bản</h1>
    <p className="grammarly-intro">
      Dưới đây là những chủ điểm ngữ pháp quan trọng nhất cho người mới học tiếng Anh.
    </p>
    <div className="grammar-grid">
      {grammarTopics.map((topic, idx) => (
        <div className="grammar-card" key={idx}>
          <h2>{topic.title}</h2>
          <p>{topic.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default GrammarlyPage;