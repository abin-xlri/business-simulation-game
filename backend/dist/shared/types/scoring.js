"use strict";
// Comprehensive Scoring System Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskType = exports.CompetencyCategory = void 0;
// Enums
var CompetencyCategory;
(function (CompetencyCategory) {
    CompetencyCategory["ANALYTICAL_THINKING"] = "ANALYTICAL_THINKING";
    CompetencyCategory["STRATEGIC_PLANNING"] = "STRATEGIC_PLANNING";
    CompetencyCategory["COLLABORATION"] = "COLLABORATION";
    CompetencyCategory["LEADERSHIP"] = "LEADERSHIP";
    CompetencyCategory["PROBLEM_SOLVING"] = "PROBLEM_SOLVING";
    CompetencyCategory["DECISION_MAKING"] = "DECISION_MAKING";
    CompetencyCategory["COMMUNICATION"] = "COMMUNICATION";
    CompetencyCategory["ADAPTABILITY"] = "ADAPTABILITY";
    CompetencyCategory["INNOVATION"] = "INNOVATION";
    CompetencyCategory["EXECUTION"] = "EXECUTION";
})(CompetencyCategory || (exports.CompetencyCategory = CompetencyCategory = {}));
var TaskType;
(function (TaskType) {
    TaskType["ROUND1_TASK1_ROUTE_OPTIMIZATION"] = "ROUND1_TASK1_ROUTE_OPTIMIZATION";
    TaskType["ROUND1_TASK2_PARTNER_SELECTION"] = "ROUND1_TASK2_PARTNER_SELECTION";
    TaskType["ROUND2_GROUP_MARKET_SELECTION"] = "ROUND2_GROUP_MARKET_SELECTION";
    TaskType["ROUND2_GROUP_BUDGET_ALLOCATION"] = "ROUND2_GROUP_BUDGET_ALLOCATION";
    TaskType["ROUND3_TASK1_CRISIS_WEB"] = "ROUND3_TASK1_CRISIS_WEB";
    TaskType["ROUND3_TASK2_REACTIVATION_CHALLENGE"] = "ROUND3_TASK2_REACTIVATION_CHALLENGE";
})(TaskType || (exports.TaskType = TaskType = {}));
//# sourceMappingURL=scoring.js.map