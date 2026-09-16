const title = value => String(value || '').trim().replace(/^(Thành\s+phố|TP\.?|Tỉnh)\s+/iu, '').trim();
const key = value => title(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
const posted = room => new Date(room.postedAt || room.createdAt || 0).getTime() || 0;

exports.buildHomeSummary = (rooms, statsIds = [], regionCounts = null) => {
  const cities = new Map();
  for (const room of rooms) {
    const normalized = key(room.city);
    if (!normalized) continue;
    if (!cities.has(normalized)) cities.set(normalized, { count: 0, names: new Map() });
    const city = cities.get(normalized);
    city.count++;
    const raw = String(room.city).trim();
    city.names.set(raw, (city.names.get(raw) || 0) + 1);
  }
  const regions = [...cities.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([normalized, city]) => {
    const cityQuery = title([...city.names.entries()].sort((a, b) => b[1] - a[1])[0][0]);
    // Match the existing city search: case-insensitive substring, rental posts only.
    const count = regionCounts
      ? regionCounts.filter(r => String(r._id || '').toLowerCase().includes(cityQuery.toLowerCase())).reduce((sum, r) => sum + r.count, 0)
      : rooms.filter(r => r.postType === 'room_rental' && String(r.city || '').toLowerCase().includes(cityQuery.toLowerCase())).length;
    return { key: normalized, title: cityQuery, cityQuery, count };
  }).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
  const recommendedRooms = [...rooms].sort((a, b) =>
    (b.rating || 0) - (a.rating || 0) || (b.totalComments || 0) - (a.totalComments || 0) || posted(a) - posted(b)
  ).slice(0, 4);
  const wanted = new Set(statsIds.slice(0, 50));
  const roomStats = {};
  for (const room of rooms) if (wanted.has(room.id)) {
    roomStats[room.id] = { avgStars: room.rating || 0, starsVotes: room.totalRatings || 0, commentsScore: room.totalComments || 0 };
  }
  return { recommendedRooms, regions, roomStats };
};
