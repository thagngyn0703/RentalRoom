import { roomThumbnail } from './roomThumbnail';

test('sizes unsigned Cloudinary images without changing the original asset', () => {
  expect(roomThumbnail('https://res.cloudinary.com/demo/image/upload/v123/rooms/a.jpg'))
    .toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v123/rooms/a.jpg');
});

test('leaves external, local, signed and already transformed images untouched', () => {
  for (const url of ['/logo192.png', 'https://example.com/a.jpg', 'https://res.cloudinary.com/demo/image/upload/s--signature--/a.jpg', 'https://res.cloudinary.com/demo/image/upload/w_200/a.jpg', '']) {
    expect(roomThumbnail(url)).toBe(url);
  }
});
