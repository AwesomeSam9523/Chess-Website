"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = exports.MoveTypes = void 0;
var MoveTypes;
(function (MoveTypes) {
    MoveTypes[MoveTypes["REGULAR"] = 0] = "REGULAR";
    MoveTypes[MoveTypes["CASTLING"] = 1] = "CASTLING";
    MoveTypes[MoveTypes["PROMOTION"] = 2] = "PROMOTION";
    MoveTypes[MoveTypes["GET_BOARD"] = 3] = "GET_BOARD";
})(MoveTypes || (exports.MoveTypes = MoveTypes = {}));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["SUCCESS_MESSAGE"] = 0] = "SUCCESS_MESSAGE";
    MessageType[MessageType["ERROR_MESSAGE"] = 1] = "ERROR_MESSAGE";
})(MessageType || (exports.MessageType = MessageType = {}));
