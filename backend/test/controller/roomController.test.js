const roomController = require('../../controllers/roomController');
const Room = require('../../models/Room');
const Post = require('../../models/Post');
const User = require('../../models/Users');
const Booking = require('../../models/Booking');

jest.mock('../../models/Room');
jest.mock('../../models/Post');
jest.mock('../../models/Users');
jest.mock('../../models/Booking');

describe('roomController', () => {
  describe('createRoom', () => {
    it('should create a new room and return 201', async () => {
      const req = {
        body: { name: 'Test Room' },
        user: { _id: 'user123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      Room.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(true) }));
      await roomController.createRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    it('should handle errors and return 500', async () => {
      const req = { body: {}, user: { _id: 'user123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error('fail')) }));
      await roomController.createRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('getRooms', () => {
    it('should return paginated rooms', async () => {
      const req = {
        query: {},
        user: { _id: 'user123' }
      };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRooms = [{ _id: '1', toObject: () => ({ _id: '1', status: 'available' }) }];
      Room.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(fakeRooms)
      });
      Booking.find.mockReturnValue({ distinct: jest.fn().mockResolvedValue([]) });
      await roomController.getRooms(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rooms: expect.any(Array) }));
    });
    it('should handle errors and return 500', async () => {
      const req = { query: {}, user: { _id: 'user123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.find.mockImplementation(() => { throw new Error('fail'); });
      await roomController.getRooms(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
      Room.find.mockReset();
    });
  });

  describe('getRoomDetail', () => {
    it('should return room detail for owner', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123', role: 'user' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRoom = { _id: '1', user: { _id: 'user123' }, toObject: () => ({ _id: '1', user: { _id: 'user123' } }) };
      Room.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(fakeRoom) });
      await roomController.getRoomDetail(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeRoom);
    });
    it('should return 404 if room not found', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123', role: 'user' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(null) });
      await roomController.getRoomDetail(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
    });
  });

  describe('getRoomCurrentTenant', () => {
    it('should return current tenant info', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123', role: 'admin' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRoom = { _id: '1', user: { _id: 'user123' } };
      Room.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeRoom) });
      Booking.findOne.mockReturnValue({ populate: jest.fn().mockReturnThis(), sort: jest.fn().mockResolvedValue(null) });
      await roomController.getRoomCurrentTenant(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, roomId: '1' }));
    });
    it('should return 404 if room not found', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123', role: 'admin' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await roomController.getRoomCurrentTenant(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });
  });

  describe('updateRoomStatus', () => {
    it('should update room status', async () => {
      const req = { params: { id: '1' }, body: { status: 'rented' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRoom = { _id: '1', status: 'rented' };
      Room.findByIdAndUpdate.mockResolvedValue(fakeRoom);
      await roomController.updateRoomStatus(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeRoom);
    });
    it('should return 404 if room not found', async () => {
      const req = { params: { id: '1' }, body: { status: 'rented' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.findByIdAndUpdate.mockResolvedValue(null);
      await roomController.updateRoomStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
    });
  });

  describe('updateRoom', () => {
    it('should update room info for owner', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123' }, body: { name: 'new' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRoom = { _id: '1', user: { _id: 'user123', toString: () => 'user123' } };
      Room.findById.mockResolvedValue(fakeRoom);
      Room.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(fakeRoom) });
      await roomController.updateRoom(req, res);
      expect(res.json).toHaveBeenCalled();
    });
    it('should return 404 if room not found', async () => {
      const req = { params: { id: '1' }, user: { _id: 'user123' }, body: { name: 'new' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.findById.mockResolvedValue(null);
      await roomController.updateRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
    });
  });

  describe('deleteRoom', () => {
    it('should delete room and post', async () => {
      const req = { params: { id: '1' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const fakeRoom = { _id: '1', post: 'post1' };
      Room.findByIdAndDelete.mockResolvedValue(fakeRoom);
      Post.findByIdAndDelete.mockResolvedValue(true);
      await roomController.deleteRoom(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Room and post deleted' });
    });
    it('should return 404 if room not found', async () => {
      const req = { params: { id: '1' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      Room.findByIdAndDelete.mockResolvedValue(null);
      await roomController.deleteRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Room not found' });
    });
  });
});
