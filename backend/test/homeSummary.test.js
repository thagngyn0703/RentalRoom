const { buildHomeSummary } = require('../utils/homeSummary');

test('returns four ranked rooms, rental-only city counts and only requested statistics', () => {
  const rooms = [
    { id: 'a', city: 'Thành phố Hà Nội', postType: 'room_rental', rating: 4, totalComments: 2, postedAt: '2024-01-01' },
    { id: 'b', city: 'Hà Nội', postType: 'invite roomate', rating: 5, totalComments: 1 },
    { id: 'c', city: 'Tỉnh Bắc Ninh', postType: 'room_rental', rating: 3 },
    { id: 'd', city: 'Hà Nội', postType: 'room_rental', rating: 4, totalComments: 3 },
    { id: 'e', city: 'Hà Nội', postType: 'room_rental', rating: 1 },
  ];
  const result = buildHomeSummary(rooms, ['a']);
  expect(result.recommendedRooms.map(r => r.id)).toEqual(['b', 'd', 'a', 'c']);
  expect(result.regions).toEqual([
    { key: 'ha noi', title: 'Hà Nội', cityQuery: 'Hà Nội', count: 3 },
    { key: 'bac ninh', title: 'Bắc Ninh', cityQuery: 'Bắc Ninh', count: 1 },
  ]);
  expect(result.roomStats).toEqual({ a: { avgStars: 4, starsVotes: 0, commentsScore: 2 } });
});

test('empty database returns empty summary without errors', () => {
  expect(buildHomeSummary([], [])).toEqual({ recommendedRooms: [], regions: [], roomStats: {} });
});

test('region totals use full-dataset counts, not the bounded recommendation sample', () => {
  const result = buildHomeSummary([{ id: 'a', city: 'Hà Nội', postType: 'room_rental' }], [], [
    { _id: 'Thành phố Hà Nội', count: 6000 }, { _id: 'Hà Nội', count: 25 },
  ]);
  expect(result.regions[0].count).toBe(6025);
});
