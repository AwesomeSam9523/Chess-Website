enum MoveTypes {
  REGULAR = 0,
  CASTLING = 1,
  PROMOTION = 2,
  GET_BOARD = 3,
}

enum MessageType {
  SUCCESS_MESSAGE = 0,
  ERROR_MESSAGE = 1,
}

interface ConnectionPayload {
  roomId: string;
}

interface InGamePayload {
  moveType: MoveTypes;
  from: string;
  to: string;
}

export {
  MoveTypes,
  ConnectionPayload,
  InGamePayload,
  MessageType,
};
