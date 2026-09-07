import Carousel from 'react-bootstrap/Carousel';

function CarouselFadeExample() {
  const base = process.env.PUBLIC_URL || '';

  const slides = [
    {
      src: 'banner1.jpg',
      heading: 'Chào mừng bạn đến TroChung',
    },
    {
      src: 'banner2.jpg',
      heading: 'Khám phá phòng mới mỗi ngày',
    },
    {
      src: 'banner2.jpg',
      heading: 'Kết nối nhanh chóng',
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
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default CarouselFadeExample;
