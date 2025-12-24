import React, { useState } from 'react';
import './GrammarlyPage.css';

const TENSE_TYPES = [
  { key: 'affirmative', label: 'Khẳng định' },
  { key: 'negative', label: 'Phủ định' },
  { key: 'question', label: 'Nghi vấn' },
];

const tenses = [
  {
    name: 'Hiện tại đơn (Simple Present)',
    use: 'Diễn tả thói quen, sự thật hiển nhiên, hoặc lịch trình.',
    structure: {
      affirmative: 'Chủ ngữ + động từ nguyên mẫu (thêm -s/-es với he/she/it)',
      negative: 'Chủ ngữ + do/does + not + động từ nguyên mẫu',
      question: 'Do/Does + chủ ngữ + động từ nguyên mẫu?',
    },
    example: {
      affirmative: 'I study English every day.',
      negative: 'I do not (don\'t) study English every day.',
      question: 'Do you study English every day?',
    },
    note: 'Dùng cho hành động lặp lại hoặc sự thật chung.',
  },
  {
    name: 'Quá khứ đơn (Simple Past)',
    use: 'Diễn tả hành động đã hoàn thành trong quá khứ tại một thời điểm xác định.',
    structure: {
      affirmative: 'Chủ ngữ + động từ quá khứ (-ed hoặc bất quy tắc)',
      negative: 'Chủ ngữ + did not (didn\'t) + động từ nguyên mẫu',
      question: 'Did + chủ ngữ + động từ nguyên mẫu?',
    },
    example: {
      affirmative: 'I studied English yesterday.',
      negative: 'I did not (didn\'t) study English yesterday.',
      question: 'Did you study English yesterday?',
    },
    note: 'Nhấn mạnh hành động đã kết thúc.',
  },
  {
    name: 'Tương lai đơn (Simple Future)',
    use: 'Diễn tả hành động sẽ xảy ra trong tương lai.',
    structure: {
      affirmative: 'Chủ ngữ + will + động từ nguyên mẫu',
      negative: 'Chủ ngữ + will not (won\'t) + động từ nguyên mẫu',
      question: 'Will + chủ ngữ + động từ nguyên mẫu?',
    },
    example: {
      affirmative: 'I will study English tomorrow.',
      negative: 'I will not (won\'t) study English tomorrow.',
      question: 'Will you study English tomorrow?',
    },
    note: 'Dùng cho dự đoán hoặc quyết định tại thời điểm nói.',
  },
  {
    name: 'Hiện tại hoàn thành (Present Perfect)',
    use: 'Diễn tả hành động đã xảy ra và còn liên quan đến hiện tại.',
    structure: {
      affirmative: 'Chủ ngữ + have/has + quá khứ phân từ',
      negative: 'Chủ ngữ + have/has not (haven\'t/hasn\'t) + quá khứ phân từ',
      question: 'Have/Has + chủ ngữ + quá khứ phân từ?',
    },
    example: {
      affirmative: 'I have studied English for two years.',
      negative: 'I have not (haven\'t) studied English for two years.',
      question: 'Have you studied English for two years?',
    },
    note: 'Kết nối quá khứ với hiện tại.',
  },
  {
    name: 'Quá khứ hoàn thành (Past Perfect)',
    use: 'Diễn tả hành động đã hoàn thành trước một hành động khác trong quá khứ.',
    structure: {
      affirmative: 'Chủ ngữ + had + quá khứ phân từ',
      negative: 'Chủ ngữ + had not (hadn\'t) + quá khứ phân từ',
      question: 'Had + chủ ngữ + quá khứ phân từ?',
    },
    example: {
      affirmative: 'I had studied English before I moved.',
      negative: 'I had not (hadn\'t) studied English before I moved.',
      question: 'Had you studied English before you moved?',
    },
    note: 'Nhấn mạnh trình tự hai hành động trong quá khứ.',
  },
  {
    name: 'Tương lai hoàn thành (Future Perfect)',
    use: 'Diễn tả hành động sẽ hoàn thành trước một thời điểm trong tương lai.',
    structure: {
      affirmative: 'Chủ ngữ + will have + quá khứ phân từ',
      negative: 'Chủ ngữ + will not (won\'t) have + quá khứ phân từ',
      question: 'Will + chủ ngữ + have + quá khứ phân từ?',
    },
    example: {
      affirmative: 'I will have studied English by next month.',
      negative: 'I will not (won\'t) have studied English by next month.',
      question: 'Will you have studied English by next month?',
    },
    note: 'Nhấn mạnh sự hoàn thành trước mốc thời gian tương lai.',
  },
  {
    name: 'Hiện tại tiếp diễn (Present Continuous)',
    use: 'Diễn tả hành động đang xảy ra ngay lúc nói hoặc tạm thời.',
    structure: {
      affirmative: 'Chủ ngữ + am/is/are + động từ-ing',
      negative: 'Chủ ngữ + am/is/are not + động từ-ing',
      question: 'Am/Is/Are + chủ ngữ + động từ-ing?',
    },
    example: {
      affirmative: 'I am studying English now.',
      negative: 'I am not studying English now.',
      question: 'Are you studying English now?',
    },
    note: 'Nhấn mạnh hành động đang diễn ra.',
  },
  {
    name: 'Quá khứ tiếp diễn (Past Continuous)',
    use: 'Diễn tả hành động đang xảy ra tại một thời điểm trong quá khứ, thường bị gián đoạn.',
    structure: {
      affirmative: 'Chủ ngữ + was/were + động từ-ing',
      negative: 'Chủ ngữ + was/were not + động từ-ing',
      question: 'Was/Were + chủ ngữ + động từ-ing?',
    },
    example: {
      affirmative: 'I was studying English when you called.',
      negative: 'I was not (wasn\'t) studying English when you called.',
      question: 'Were you studying English when I called?',
    },
    note: 'Nhấn mạnh sự kéo dài hoặc gián đoạn trong quá khứ.',
  },
  {
    name: 'Tương lai tiếp diễn (Future Continuous)',
    use: 'Diễn tả hành động sẽ đang diễn ra tại một thời điểm xác định trong tương lai.',
    structure: {
      affirmative: 'Chủ ngữ + will be + động từ-ing',
      negative: 'Chủ ngữ + will not (won\'t) be + động từ-ing',
      question: 'Will + chủ ngữ + be + động từ-ing?',
    },
    example: {
      affirmative: 'I will be studying English at 8 PM.',
      negative: 'I will not (won\'t) be studying English at 8 PM.',
      question: 'Will you be studying English at 8 PM?',
    },
    note: 'Nhấn mạnh hành động đang diễn ra trong tương lai.',
  },
  {
    name: 'Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)',
    use: 'Nhấn mạnh hành động bắt đầu trong quá khứ và còn tiếp tục đến hiện tại.',
    structure: {
      affirmative: 'Chủ ngữ + have/has + been + động từ-ing',
      negative: 'Chủ ngữ + have/has not (haven\'t/hasn\'t) + been + động từ-ing',
      question: 'Have/Has + chủ ngữ + been + động từ-ing?',
    },
    example: {
      affirmative: 'I have been studying English for hours.',
      negative: 'I have not (haven\'t) been studying English for hours.',
      question: 'Have you been studying English for hours?',
    },
    note: 'Nhấn mạnh sự kéo dài và liên quan đến hiện tại.',
  },
  {
    name: 'Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)',
    use: 'Diễn tả hành động kéo dài trước một hành động khác trong quá khứ.',
    structure: {
      affirmative: 'Chủ ngữ + had + been + động từ-ing',
      negative: 'Chủ ngữ + had not (hadn\'t) + been + động từ-ing',
      question: 'Had + chủ ngữ + been + động từ-ing?',
    },
    example: {
      affirmative: 'I had been studying English before the class started.',
      negative: 'I had not (hadn\'t) been studying English before the class started.',
      question: 'Had you been studying English before the class started?',
    },
    note: 'Nhấn mạnh nguyên nhân hoặc bối cảnh của sự việc trong quá khứ.',
  },
  {
    name: 'Tương lai hoàn thành tiếp diễn (Future Perfect Continuous)',
    use: 'Diễn tả hành động sẽ kéo dài đến một thời điểm trong tương lai.',
    structure: {
      affirmative: 'Chủ ngữ + will have been + động từ-ing',
      negative: 'Chủ ngữ + will not (won\'t) have been + động từ-ing',
      question: 'Will + chủ ngữ + have been + động từ-ing?',
    },
    example: {
      affirmative: 'I will have been studying English for three years by 2026.',
      negative: 'I will not (won\'t) have been studying English for three years by 2026.',
      question: 'Will you have been studying English for three years by 2026?',
    },
    note: 'Kết hợp sự hoàn thành và kéo dài trong tương lai.',
  },
];

const BasicTenses = () => {
  const [type, setType] = useState('affirmative');

  return (
    <div className="basic-tenses-page">
      <h1 className="tenses-title">12 Thì Cơ Bản Trong Tiếng Anh</h1>
      <p className="tenses-intro">
        Bảng tổng hợp các thì quan trọng nhất với ví dụ minh họa.
      </p>
      <div className="tenses-type-navbar">
        {TENSE_TYPES.map((t) => (
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
              <th>Tên thì</th>
              <th>Cách dùng</th>
              <th>Cấu trúc ({TENSE_TYPES.find(t => t.key === type).label})</th>
              <th>Ví dụ ({TENSE_TYPES.find(t => t.key === type).label})</th>
              <th>Lưu ý</th>
            </tr>
          </thead>
          <tbody>
            {tenses.map((tense, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{tense.name}</td>
                <td>{tense.use}</td>
                <td>{tense.structure[type]}</td>
                <td>{tense.example[type]}</td>
                <td>{tense.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BasicTenses;
