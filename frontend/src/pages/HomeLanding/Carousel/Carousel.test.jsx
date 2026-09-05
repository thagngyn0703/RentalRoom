import { render, screen } from '@testing-library/react';
import CarouselFadeExample from './Carousel';

test('does not overlay duplicate campaign copy on text-bearing artwork', () => {
  render(<CarouselFadeExample />);

  expect(screen.queryByText('Khám phá phòng mới mỗi ngày')).not.toBeInTheDocument();
  expect(screen.getAllByRole('img')).toHaveLength(3);
});
