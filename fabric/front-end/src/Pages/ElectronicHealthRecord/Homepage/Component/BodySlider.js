import React, { useState } from 'react';
import '../../../CSS/Patient/PatientPage.css';
import hospitalImage1 from '../../../Images/hospital1.png';
import hospitalImage2 from '../../../Images/hospital2.png';
import hospitalImage3 from '../../../Images/hospital3.png';
import ehrImage from '../../../Images/ehr.jpg';
import patientImage from '../../../Images/patient4.jpg';
import doctorImage from '../../../Images/doctor7.jpg';
import doctorIcon from '../../../Images/doctor-avatar2.jpg';
import doctorIcon1 from '../../../Images/doctor-avatar3.jpg';

function BodySlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [ehrImage, hospitalImage2, hospitalImage3];

  const handlePrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === 0 ? images.length - 1 : prevSlide - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide === images.length - 1 ? 0 : prevSlide + 1));
  };

  const ReviewSection = () => {
    // Sample review data
    const reviews = [
      {
        id: 1,
        image: doctorIcon, // Replace with actual image URLs
        name: 'Shaun Murphy',
        review: 'As a medical professional, I am highly impressed with the EHR system powered by Hyperledger Fabric. The seamless integration of patient records, efficient data management, and advanced security features make it an invaluable tool for healthcare providers. The user-friendly interface and accessibility further enhance the overall experience. Kudos to the team behind this innovative solution!',
      },
      {
        id: 2,
        image: doctorIcon1,
        name: 'Patrick Soon Shiong',
        review: 'The EHR system has truly revolutionized the way we manage patient information. Its ability to streamline processes, improve communication, and ensure data accuracy has significantly contributed to elevating the standard of patient care. I appreciate the commitment to excellence demonstrated by the developers and the positive impact this technology has on healthcare.',
      },
      // Add more reviews as needed
    ];
  
    return (
      <div className="review-section">
        <h2>Doctor Reviews</h2>
        <div className="review-cards">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-content">
                <img src={review.image} alt={`Dr. ${review.name}`} className="doctor-image" />
                <div className="review-details">
                  <span className="doctor-name">{`Dr. ${review.name}`}</span>
                  <p className="review-text">{review.review}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };  

  return (
    <div className="body">
      <div className="slider">
        <div className="slide" style={{ backgroundImage: `url(${images[currentSlide]})` }}>
          <button className="arrow left-arrow" onClick={handlePrevSlide}>
            &lt;
          </button>
          <button className="arrow right-arrow" onClick={handleNextSlide}>
            &gt;
          </button>
        </div>
      </div>

      <div className="additional-content">
        <h2>Enhance Patient Care with Our EHR System</h2>
        <p>Discover the benefits of our Electronic Health Record system and how it can revolutionize healthcare delivery.</p>
      </div>

      <div className="card-container">
        {/* Example Cards */}
        <div className="card">
          <img src={patientImage} alt="Hospital 1" />
          <div className="card-text">
            <h3>Bệnh nhân</h3>
            <p>Truy cập hồ sơ y tế của bạn một cách an toàn từ mọi nơi, đảm bảo tính liên tục của việc chăm sóc.</p>
            <p>Nhận thông tin cập nhật kịp thời về các cuộc hẹn, thuốc và kết quả xét nghiệm.</p>
            <p>Trao quyền cho bản thân với những hiểu biết sâu sắc hơn về lịch sử sức khỏe và kế hoạch điều trị của bạn.</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>

        <div className="card">
          <img src={doctorImage} alt="Hospital 2" />
          <div className="card-text">
            <h3>Bác sĩ</h3>
            <p>Hợp lý hóa việc chăm sóc bệnh nhân với khả năng truy cập hiệu quả vào hồ sơ y tế toàn diện và cập nhật.</p>
            <p>Cải thiện sự hợp tác giữa các nhà cung cấp dịch vụ chăm sóc sức khỏe để đưa ra quyết định sáng suốt hơn.</p>
            <p>Nâng cao độ chính xác của chẩn đoán và lập kế hoạch điều trị với cái nhìn toàn diện về dữ liệu bệnh nhân.</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>

        <div className="card">
          <img src={hospitalImage2} alt="Hospital 3" />
          <div className="card-text">
            <h3>Bệnh viện</h3>
            <p>Đảm bảo tính toàn vẹn và bảo mật dữ liệu bằng công nghệ chuỗi khối mạnh mẽ của Hyperledger Fabric.</p>
            <p>Hợp lý hóa các quy trình hành chính, giảm bớt giấy tờ và nâng cao hiệu quả hoạt động.</p>
            <p>Tạo điều kiện liên lạc và chia sẻ dữ liệu liền mạch giữa các bộ phận khác nhau.</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>
      </div>

      <ReviewSection />
    </div>
  );
}

export default BodySlider;
