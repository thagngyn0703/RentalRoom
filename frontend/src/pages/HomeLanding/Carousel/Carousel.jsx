import Carousel from 'react-bootstrap/Carousel';

function CarouselFadeExample() {
  const base = process.env.PUBLIC_URL || '';

  const slides = [
    {
      src: 'banner1.jpg',
      heading: 'Chào mừng bạn đến TroChung',
      body: 'Tìm căn phòng phù hợp chỉ với vài thao tác đơn giản.',
    },
    {
      src: 'banner2.jpg',
      heading: 'Khám phá phòng mới mỗi ngày',
      body: 'Nguồn tin cập nhật liên tục từ các chủ trọ uy tín.',
    },
    {
      src: 'banner2.jpg',
      heading: 'Kết nối nhanh chóng',
      body: 'Liên hệ chủ trọ, đặt lịch xem và theo dõi yêu thích.',
    },
  ];

  return (
    <Carousel fade controls indicators>
      {slides.map((slide, idx) => (
        <Carousel.Item key={idx}>
          <img
            className="d-block w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
            src={`${base}/${slide.src}`}
            alt={slide.heading}
          />
          <Carousel.Caption>
            <h3>{slide.heading}</h3>
            <p>{slide.body}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselFadeExample;