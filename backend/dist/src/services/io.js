"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = setIO;
exports.getIO = getIO;
let ioInstance = null;
function setIO(server) {
    ioInstance = server;
}
function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io server has not been initialized');
    }
    return ioInstance;
}
//# sourceMappingURL=io.js.map