import React, { useState } from 'react';
import './GrammarlyPage.css';

const TYPES = [
  { key: 'affirmative', label: 'Khẳng định' },
  { key: 'negative', label: 'Phủ định' },
  { key: 'question', label: 'Nghi vấn' },
];

const partsOfSpeech = [
  {
    name: 'Danh từ (Nouns)',
    definition: 'Từ dùng để gọi tên người, địa điểm, sự vật hoặc ý tưởng.',
    types: 'Danh từ chung (student, city), danh từ riêng (Hà Nội, Lan), số ít/số nhiều (book/books), sở hữu (Lan’s book, students’ books).',
    example: {
      affirmative: 'Lan has a new book.',
      negative: 'Lan does not have a new book.',
      question: 'Does Lan have a new book?',
    },
    note: 'Viết hoa danh từ riêng và chú ý danh từ số nhiều bất quy tắc (child/children).',
  },
  {
    name: 'Đại từ (Pronouns)',
    definition: 'Từ thay thế cho danh từ để tránh lặp lại.',
    types: 'Đại từ nhân xưng (I, you, he...), đại từ sở hữu (mine, yours...), đại từ phản thân (myself, yourself...).',
    example: {
      affirmative: 'She loves her family.',
      negative: 'She does not love her family.',
      question: 'Does she love her family?',
    },
    note: 'Đảm bảo đại từ phù hợp với danh từ về số lượng và giới tính (John lost his book).',
  },
  {
    name: 'Động từ (Verbs)',
    definition: 'Từ chỉ hành động, trạng thái hoặc sự việc.',
    types: 'Động từ hành động (run, write), động từ nối (is, seem), trợ động từ (have, will).',
    example: {
      affirmative: 'They play football after school.',
      negative: 'They do not play football after school.',
      question: 'Do they play football after school?',
    },
    note: 'Động từ thay đổi theo thì và hòa hợp với chủ ngữ (write/wrote/will write).',
  },
  {
    name: 'Tính từ (Adjectives)',
    definition: 'Từ bổ nghĩa cho danh từ, chỉ tính chất, số lượng hoặc mức độ.',
    types: 'So sánh hơn (bigger), so sánh nhất (biggest).',
    example: {
      affirmative: 'This is a beautiful garden.',
      negative: 'This is not a beautiful garden.',
      question: 'Is this a beautiful garden?',
    },
    note: 'Tính từ thường đứng trước danh từ hoặc sau động từ nối (The house is big).',
  },
  {
    name: 'Trạng từ (Adverbs)',
    definition: 'Từ bổ nghĩa cho động từ, tính từ hoặc trạng từ khác, chỉ cách thức, thời gian, mức độ.',
    types: 'Thường kết thúc bằng -ly (quickly), nhưng không phải luôn luôn (fast).',
    example: {
      affirmative: 'He speaks English fluently.',
      negative: 'He does not speak English fluently.',
      question: 'Does he speak English fluently?',
    },
    note: 'Không lạm dụng trạng từ; dùng để làm rõ ý nghĩa hành động.',
  },
  {
    name: 'Giới từ (Prepositions)',
    definition: 'Từ chỉ mối quan hệ giữa danh từ/đại từ với từ khác (vị trí, thời gian).',
    types: 'in, on, at, by, with...',
    example: {
      affirmative: 'The cat is under the table.',
      negative: 'The cat is not under the table.',
      question: 'Is the cat under the table?',
    },
    note: 'Giới từ thường đi kèm cụm giới từ (in the park).',
  },
  {
    name: 'Liên từ (Conjunctions)',
    definition: 'Từ nối các từ, cụm từ hoặc mệnh đề.',
    types: 'Phối hợp (and, but, or), phụ thuộc (because, although).',
    example: {
      affirmative: 'I like tea and coffee.',
      negative: 'I do not like tea but I like coffee.',
      question: 'Do you like tea or coffee?',
    },
    note: 'Dùng dấu phẩy với liên từ phối hợp trong câu ghép.',
  },
  {
    name: 'Thán từ (Interjections)',
    definition: 'Từ/cụm từ diễn tả cảm xúc, thường đứng riêng.',
    types: 'Wow, oh, ouch...',
    example: {
      affirmative: 'Wow! You did a great job!',
      negative: 'Oh no! I did not win the prize!',
      question: 'Hey! Are you coming with us?',
    },
    note: 'Thường theo sau bởi dấu chấm than và dùng trong văn nói.',
  },
];

const PartsOfSpeech = () => {
  const [type, setType] = useState('affirmative');

  return (
    <div className="basic-tenses-page">
      <h1 className="tenses-title">Từ Loại (Parts of Speech) Cơ Bản</h1>
      <p className="tenses-intro">
        Bảng tổng hợp các từ loại quan trọng nhất trong tiếng Anh với ví dụ minh họa.
      </p>
      <div className="tenses-type-navbar">
        {TYPES.map((t) => (
          <button
            key={t.key}
            className={`tenses-type-btn${type === t.key ? ' active' : ''}`}
            onClick={() => setType(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tenses-table-wrapper">
        <table className="tenses-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Từ loại</th>
              <th>Định nghĩa</th>
              <th>Phân loại / Dạng</th>
              <th>Ví dụ ({TYPES.find(t => t.key === type).label})</th>
              <th>Lưu ý</th>
            </tr>
          </thead>
          <tbody>
            {partsOfSpeech.map((item, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{item.name}</td>
                <td>{item.definition}</td>
                <td>{item.types}</td>
                <td>{item.example[type]}</td>
                <td>{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartsOfSpeech;
