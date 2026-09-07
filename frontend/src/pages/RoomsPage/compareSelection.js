const roomKey = (room) => String(room?.id ?? room?._id ?? '');

export const addRoom = (selected, room) => {
  if (!room || selected.some((item) => roomKey(item) === roomKey(room)) || selected.length >= 2) {
    return selected;
  }
  return [...selected, room];
};

export const removeRoom = (selected, id) => selected.filter((room) => roomKey(room) !== String(id));

export const toggleRoom = (selected, room) => (
  selected.some((item) => roomKey(item) === roomKey(room))
    ? removeRoom(selected, roomKey(room))
    : addRoom(selected, room)
);

export { roomKey };
