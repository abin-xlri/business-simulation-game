"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionStatus = exports.MessageType = exports.GroupRole = exports.GroupStatus = exports.GroupTaskType = void 0;
var GroupTaskType;
(function (GroupTaskType) {
    GroupTaskType["MARKET_SELECTION"] = "MARKET_SELECTION";
    GroupTaskType["BUDGET_ALLOCATION"] = "BUDGET_ALLOCATION";
})(GroupTaskType || (exports.GroupTaskType = GroupTaskType = {}));
var GroupStatus;
(function (GroupStatus) {
    GroupStatus["ACTIVE"] = "ACTIVE";
    GroupStatus["COMPLETED"] = "COMPLETED";
    GroupStatus["DISBANDED"] = "DISBANDED";
})(GroupStatus || (exports.GroupStatus = GroupStatus = {}));
var GroupRole;
(function (GroupRole) {
    GroupRole["LEADER"] = "LEADER";
    GroupRole["MEMBER"] = "MEMBER";
})(GroupRole || (exports.GroupRole = GroupRole = {}));
var MessageType;
(function (MessageType) {
    MessageType["CHAT"] = "CHAT";
    MessageType["SYSTEM"] = "SYSTEM";
    MessageType["DECISION"] = "DECISION";
})(MessageType || (exports.MessageType = MessageType = {}));
var DecisionStatus;
(function (DecisionStatus) {
    DecisionStatus["PENDING"] = "PENDING";
    DecisionStatus["APPROVED"] = "APPROVED";
    DecisionStatus["REJECTED"] = "REJECTED";
})(DecisionStatus || (exports.DecisionStatus = DecisionStatus = {}));
//# sourceMappingURL=groupCollaboration.js.map