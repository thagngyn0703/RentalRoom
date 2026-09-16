import { render, screen, fireEvent } from '@testing-library/react';
import ImageGallery from './ImageGallery';
test('uses sized gallery images and loads the original only when opened', () => {
  const original = 'https://res.cloudinary.com/demo/image/upload/v123/room.jpg';
  render(<ImageGallery room={{ title: 'Room', images: [original, original.replace('room', 'other')] }} />);
  expect(screen.getByAltText('Room 1').src).toContain('w_1280');
  expect(screen.getByAltText('Room thumb 1').src).toContain('w_240');
  expect(screen.getByAltText('Room thumb 1')).toHaveAttribute('loading', 'lazy');
  expect(screen.queryByAltText('Room full 1')).not.toBeInTheDocument();
  fireEvent.click(screen.getByAltText('Room 1'));
  expect(screen.getByAltText('Room full 1')).toHaveAttribute('src', original);
});
