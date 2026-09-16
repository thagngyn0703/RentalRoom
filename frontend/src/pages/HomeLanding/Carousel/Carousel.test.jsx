import { render, screen } from '@testing-library/react';
import CarouselFadeExample from './Carousel';

test('provides direct paths to rental search and roommate search', () => {
  render(<CarouselFadeExample />);

  expect(screen.getByRole('link', { name: /khám phá phòng/i })).toHaveAttribute('href', '/rooms');
  expect(screen.getByRole('link', { name: /tìm bạn ở ghép/i })).toHaveAttribute('href', '/invite-rooms');
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
});
