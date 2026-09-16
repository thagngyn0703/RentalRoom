import { render, screen } from '@testing-library/react';
import CarouselFadeExample from './Carousel';

test('provides rental search while the roommate shortcut is hidden', () => {
  render(<CarouselFadeExample />);

  expect(screen.getByRole('link', { name: /khám phá phòng/i })).toHaveAttribute('href', '/rooms');
  expect(screen.queryByRole('link', { name: /tìm bạn ở ghép/i })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
});
