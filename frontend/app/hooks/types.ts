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

interface ServerResponse {
  type: MessageType;
  responseType: ResponseType;
  message: any;
}

export {
  MoveTypes,
  MessageType,
  ResponseType
};

export type { ServerResponse };

