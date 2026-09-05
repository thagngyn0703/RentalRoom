import { resolveApiBaseUrl } from './apiBaseUrl';

test('uses the browser origin when no API URL is configured', () => {
  expect(resolveApiBaseUrl(undefined)).toBe('');
  expect(resolveApiBaseUrl('   ')).toBe('');
});

test('trims an explicitly configured API URL', () => {
  expect(resolveApiBaseUrl(' http://127.0.0.1:8000/ ')).toBe('http://127.0.0.1:8000/');
});
