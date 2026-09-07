import { addRoom, removeRoom, toggleRoom } from './compareSelection';

const roomA = { id: 'a', title: 'Phòng A' };
const roomB = { id: 'b', title: 'Phòng B' };
const roomC = { id: 'c', title: 'Phòng C' };

test('adds at most two distinct rooms', () => {
  expect(addRoom([], roomA)).toEqual([roomA]);
  expect(addRoom([roomA], roomB)).toEqual([roomA, roomB]);
  expect(addRoom([roomA, roomB], roomC)).toEqual([roomA, roomB]);
});

test('toggles and removes a selected room immutably', () => {
  expect(toggleRoom([roomA], roomA)).toEqual([]);
  expect(toggleRoom([roomA], roomB)).toEqual([roomA, roomB]);
  expect(removeRoom([roomA, roomB], 'a')).toEqual([roomB]);
});
