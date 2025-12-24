import React from 'react';
import './SentenceStructure.css';

const SentenceStructure = () => (
  <div className="basic-tenses-page">
    <h1 className="tenses-title">Cấu Trúc Câu (Sentence Structure)</h1>
    <p className="tenses-intro">
      Tổng hợp các loại câu cơ bản trong tiếng Anh: câu đơn, câu ghép, câu phức và câu ghép-phức.
    </p>

    <div className="grammar-section">
      <h2>1. Câu đơn (Simple Sentence)</h2>
      <p>
        Câu đơn là câu có một mệnh đề với một chủ ngữ và một động từ.<br />
        <b>Cấu tạo:</b> SV
      </p>
      <ul>
        <li>Computers are important in the modern world.</li>
      </ul>
      <p>
        Câu đơn cũng có thể có nhiều chủ ngữ hoặc nhiều động từ:
      </p>
      <ul>
        <li>Computers and other technological devices are important in the modern world. <br /><b>Cấu tạo:</b> SSV</li>
        <li>I search for information and play games on my computer. <br /><b>Cấu tạo:</b> SVV</li>
        <li>My brother and I search for information and play games on our computers. <br /><b>Cấu tạo:</b> SSVV</li>
      </ul>
    </div>

    <div className="grammar-section">
      <h2>2. Câu ghép (Compound Sentence)</h2>
      <p>
        Câu ghép gồm hai hoặc nhiều mệnh đề độc lập, nối với nhau bằng liên từ phối hợp (FANBOYS: for, and, nor, but, or, yet, so).
      </p>
      <ul>
        <li>Computers are important, but they can be dangerous too. <br /><b>Cấu tạo:</b> SV but SV</li>
        <li>Computers are important, but they can be dangerous too, so we must be careful. <br /><b>Cấu tạo:</b> SV but SV so SV</li>
      </ul>
      <p>
        <b>Lưu ý:</b> Không nên nối quá nhiều mệnh đề bằng cùng một liên từ.
      </p>
      <ul>
        <li>
          <span style={{ color: 'red' }}>Sai:</span> Computers are used widely in most countries now, and they are a sign of progress, and we must ensure everyone has access to them.
        </li>
        <li>
          <span style={{ color: 'green' }}>Đúng:</span> Computers are used widely in most countries now, and they are a sign of progress. We must ensure everyone has access to them.
        </li>
        <li>
          <span style={{ color: 'green' }}>Đúng:</span> Computers are used widely in most countries now, and they are a sign of progress, so we must ensure everyone has access to them.
        </li>
      </ul>
      <p>
        <b>Dùng dấu chấm phẩy:</b> Có thể nối hai mệnh đề liên quan bằng dấu chấm phẩy nếu không dùng liên từ phối hợp.<br />
        <i>Computers are used widely in most countries; they are a sign of progress.</i>
      </p>
    </div>

    <div className="grammar-section">
      <h2>3. Câu phức (Complex Sentence)</h2>
      <p>
        Câu phức gồm một mệnh đề chính và một hoặc nhiều mệnh đề phụ, nối với nhau bằng liên từ phụ thuộc (because, although, if, when, as soon as, even though, etc.).
      </p>
      <ul>
        <li>People take natural health supplements even though they may not have been tested.</li>
        <li>Our children may not be properly educated if we don't spend more on schools.</li>
        <li>I went to bed as soon as he left because I was tired.</li>
      </ul>
      <p>
        <b>Lưu ý:</b> Nếu mệnh đề phụ đứng trước, cần dùng dấu phẩy.<br />
        <i>Even though they may not have been tested, people take natural health supplements.</i>
      </p>
    </div>

    <div className="grammar-section">
      <h2>4. Câu ghép-phức (Compound-Complex Sentence)</h2>
      <p>
        Câu ghép-phức kết hợp đặc điểm của câu ghép và câu phức, gồm ít nhất hai mệnh đề độc lập và một mệnh đề phụ thuộc.
      </p>
      <ul>
        <li>
          I ate a lot when I got home, but I was still hungry.<br />
          <b>Phân tích:</b> "I ate a lot when I got home" (câu phức) + "but I was still hungry" (câu đơn).
        </li>
        <li>
          I ate a lot when I got home, but I was still hungry, so I went shopping to buy some more food.
        </li>
      </ul>
    </div>
  </div>
);

export default SentenceStructure;
