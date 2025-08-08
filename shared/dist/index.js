"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventType = exports.FacilityType = exports.Skill = exports.Position = exports.Industry = void 0;
// Enums
var Industry;
(function (Industry) {
    Industry["TECHNOLOGY"] = "technology";
    Industry["MANUFACTURING"] = "manufacturing";
    Industry["RETAIL"] = "retail";
    Industry["HEALTHCARE"] = "healthcare";
    Industry["FINANCE"] = "finance";
    Industry["ENTERTAINMENT"] = "entertainment";
})(Industry || (exports.Industry = Industry = {}));
var Position;
(function (Position) {
    Position["CEO"] = "ceo";
    Position["CTO"] = "cto";
    Position["CFO"] = "cfo";
    Position["MANAGER"] = "manager";
    Position["DEVELOPER"] = "developer";
    Position["SALES"] = "sales";
    Position["MARKETING"] = "marketing";
    Position["RESEARCH"] = "research";
})(Position || (exports.Position = Position = {}));
var Skill;
(function (Skill) {
    Skill["LEADERSHIP"] = "leadership";
    Skill["TECHNICAL"] = "technical";
    Skill["SALES"] = "sales";
    Skill["MARKETING"] = "marketing";
    Skill["RESEARCH"] = "research";
    Skill["MANAGEMENT"] = "management";
})(Skill || (exports.Skill = Skill = {}));
var FacilityType;
(function (FacilityType) {
    FacilityType["OFFICE"] = "office";
    FacilityType["FACTORY"] = "factory";
    FacilityType["WAREHOUSE"] = "warehouse";
    FacilityType["LABORATORY"] = "laboratory";
    FacilityType["STORE"] = "store";
})(FacilityType || (exports.FacilityType = FacilityType = {}));
var GameEventType;
(function (GameEventType) {
    GameEventType["MARKET_CRASH"] = "market_crash";
    GameEventType["BOOM"] = "boom";
    GameEventType["COMPETITION"] = "competition";
    GameEventType["INNOVATION"] = "innovation";
    GameEventType["REGULATION"] = "regulation";
    GameEventType["NATURAL_DISASTER"] = "natural_disaster";
})(GameEventType || (exports.GameEventType = GameEventType = {}));
//# sourceMappingURL=index.js.map