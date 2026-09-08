const { createRoomChatbotController } = require('../controllers/roomChatbotController');

const makeResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const makeQuery = (value) => ({
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
});

describe('room chatbot controller', () => {
  test('uses Gemini matches to return room recommendations with reasons', async () => {
    const posts = [{
      _id: 'post-1',
      title: 'Phòng gần Đại học Quốc gia',
      overviewDescription: 'Phòng có ban công và máy lạnh',
      postType: 'room_rental',
      room: {
        _id: 'room-1',
        price: 3500000,
        area: 28,
        roomType: 'Phòng đơn',
        province: 'TP.HCM',
        district: 'Thủ Đức',
        ward: 'Linh Trung',
        address: '12 đường A',
        utilities: ['wifi', 'máy lạnh'],
        images: ['room.jpg'],
        status: 'available',
      },
      user: { username: 'chutro' },
    }];
    const Post = { find: jest.fn(() => makeQuery(posts)) };
    const Booking = { find: jest.fn(() => ({ distinct: jest.fn().mockResolvedValue([]) })) };
    const matchRoomsWithAI = jest.fn().mockResolvedValue({
      success: true,
      matchedIds: [{ id: 'room-1', reason: 'Đúng khu vực và có máy lạnh.' }],
      stats: { totalRooms: 1, matchedRooms: 1 },
    });
    const controller = createRoomChatbotController({ Post, Booking, matchRoomsWithAI });
    const res = makeResponse();

    await controller.ask({ body: { question: 'Tìm phòng 3,5 triệu gần Đại học Quốc gia' } }, res);

    expect(Post.find).toHaveBeenCalledWith({ status: { $ne: 'rejected' }, postType: 'room_rental' });
    expect(matchRoomsWithAI).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'room-1', title: expect.any(String) })]),
      'Tìm phòng 3,5 triệu gần Đại học Quốc gia',
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      rooms: [expect.objectContaining({ id: 'room-1', aiReason: 'Đúng khu vực và có máy lạnh.' })],
    }));
    const response = res.json.mock.calls[0][0];
    expect(response.rooms[0]).not.toHaveProperty('authorInterests');
    expect(response.rooms[0]).not.toHaveProperty('authorHabits');
    expect(response.rooms[0]).not.toHaveProperty('authorDislikes');
    expect(response.rooms[0]).not.toHaveProperty('authorBio');
    expect(response.rooms[0]).not.toHaveProperty('authorAge');
    expect(response.rooms[0]).not.toHaveProperty('authorGender');
    expect(response.rooms[0]).not.toHaveProperty('authorProfession');
  });

  test('excludes rented and actively booked rooms before Gemini matching', async () => {
    const posts = [
      { _id: 'post-available', title: 'Phòng trống', room: { _id: 'room-available', status: 'available' } },
      { _id: 'post-rented', title: 'Phòng đã thuê', room: { _id: 'room-rented', status: 'rented' } },
      { _id: 'post-booked', title: 'Phòng đã đặt', room: { _id: 'room-booked', status: 'available' } },
    ];
    const Post = { find: jest.fn(() => makeQuery(posts)) };
    const Booking = { find: jest.fn(() => ({ distinct: jest.fn().mockResolvedValue(['room-booked']) })) };
    const matchRoomsWithAI = jest.fn().mockResolvedValue({
      success: true,
      matchedIds: [{ id: 'room-available', reason: 'Còn trống.' }],
    });
    const controller = createRoomChatbotController({ Post, Booking, matchRoomsWithAI });
    const res = makeResponse();

    await controller.ask({ body: { question: 'Tìm phòng còn trống' } }, res);

    expect(matchRoomsWithAI).toHaveBeenCalledWith(
      [expect.objectContaining({ id: 'room-available' })],
      'Tìm phòng còn trống',
    );
  });

  test('rejects an empty or oversized question', async () => {
    const controller = createRoomChatbotController({ Post: {}, Booking: {}, matchRoomsWithAI: jest.fn() });

    const emptyResponse = makeResponse();
    await controller.ask({ body: { question: ' ' } }, emptyResponse);
    expect(emptyResponse.status).toHaveBeenCalledWith(400);

    const longResponse = makeResponse();
    await controller.ask({ body: { question: 'a'.repeat(501) } }, longResponse);
    expect(longResponse.status).toHaveBeenCalledWith(400);
  });

  test('offers support when Gemini returns no matching room', async () => {
    const posts = [{
      _id: 'post-1',
      title: 'Phòng trọ',
      room: { _id: 'room-1', status: 'available' },
    }];
    const Post = { find: jest.fn(() => makeQuery(posts)) };
    const Booking = { find: jest.fn(() => ({ distinct: jest.fn().mockResolvedValue([]) })) };
    const controller = createRoomChatbotController({
      Post,
      Booking,
      matchRoomsWithAI: jest.fn().mockResolvedValue({ success: false, message: 'Không tìm thấy phòng phù hợp.' }),
    });
    const res = makeResponse();

    await controller.ask({ body: { question: 'Tìm penthouse trên sao Hỏa' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      rooms: [],
      canCreateTicket: true,
    }));
  });
});
