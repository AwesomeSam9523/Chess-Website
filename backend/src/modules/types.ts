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

enum ResponseType {
  INFO = 0,
  BOARD = 1,
  MOVE = 2,
}

interface ConnectionPayload {
  roomId: string;
}

interface InGamePayload {
  moveType: MoveTypes;
  from: string | undefined;
  to: string | undefined;
}

export {
  MoveTypes,
  ConnectionPayload,
  InGamePayload,
  MessageType,
  ResponseType,
};
