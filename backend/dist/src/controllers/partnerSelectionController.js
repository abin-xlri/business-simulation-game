"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnerSelection = exports.submitPartnerSelection = exports.calculatePartnerScores = exports.getPartners = void 0;
const client_1 = require("@prisma/client");
const round1Data_1 = require("../constants/round1Data");
const prisma = new client_1.PrismaClient();
const getPartners = async (req, res) => {
    try {
        res.json({
            success: true,
            partners: round1Data_1.PARTNERS
        });
    }
    catch (error) {
        console.error('Get partners error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching partners'
        });
    }
};
exports.getPartners = getPartners;
const calculatePartnerScores = async (req, res) => {
    try {
        const normalize = (value, min, max, invert = false) => {
            const clamped = Math.max(min, Math.min(max, value));
            const norm = (clamped - min) / (max - min);
            return invert ? 1 - norm : norm; // 0..1
        };
        // Precompute ranges from data where applicable
        const minDays = Math.min(...round1Data_1.PARTNERS.map(p => p.criteria.speedOfOnboardingDays));
        const maxDays = Math.max(...round1Data_1.PARTNERS.map(p => p.criteria.speedOfOnboardingDays));
        const minCost = Math.min(...round1Data_1.PARTNERS.map(p => p.criteria.costPerPatient));
        const maxCost = Math.max(...round1Data_1.PARTNERS.map(p => p.criteria.costPerPatient));
        const minCoverage = Math.min(...round1Data_1.PARTNERS.map(p => p.criteria.networkCoverage));
        const maxCoverage = Math.max(...round1Data_1.PARTNERS.map(p => p.criteria.networkCoverage));
        const scores = round1Data_1.PARTNERS.map(partner => {
            const c = partner.criteria;
            const breakdown = {
                speedOfOnboarding: normalize(c.speedOfOnboardingDays, minDays, maxDays, true) * round1Data_1.STRATEGIC_PRIORITIES.speedOfOnboarding,
                moHCoordination: normalize(c.moHCoordinationScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.moHCoordination,
                dataReporting: normalize(c.dataReportingScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.dataReporting,
                coldChainInfra: normalize(c.coldChainInfraScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.coldChainInfra,
                communityTrust: normalize(c.communityTrustScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.communityTrust,
                scalabilityYear2: normalize(c.scalabilityYear2Score, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.scalabilityYear2,
                biologicsExperience: normalize(c.biologicsExperienceScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.biologicsExperience,
                mediaPoliticalRisk: normalize(c.mediaPoliticalRiskScore, 1, 10, true) * round1Data_1.STRATEGIC_PRIORITIES.mediaPoliticalRisk,
                networkCoverage: normalize(c.networkCoverage, minCoverage, maxCoverage, false) * round1Data_1.STRATEGIC_PRIORITIES.networkCoverage,
                costPerPatient: normalize(c.costPerPatient, minCost, maxCost, true) * round1Data_1.STRATEGIC_PRIORITIES.costPerPatient,
            };
            const totalScore = Object.values(breakdown).reduce((sum, v) => sum + v, 0) * round1Data_1.MAX_PARTNER_SCORE; // scale to 0..10
            return { partner, score: totalScore, breakdown };
        });
        res.json({
            success: true,
            scores,
            maxScore: round1Data_1.MAX_PARTNER_SCORE,
            priorities: round1Data_1.STRATEGIC_PRIORITIES
        });
    }
    catch (error) {
        console.error('Calculate partner scores error:', error);
        res.status(500).json({
            error: 'Internal server error while calculating partner scores'
        });
    }
};
exports.calculatePartnerScores = calculatePartnerScores;
const submitPartnerSelection = async (req, res) => {
    try {
        const { partnerId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        if (!partnerId || !['A', 'B', 'C', 'D'].includes(partnerId)) {
            return res.status(400).json({
                error: 'Invalid partner ID. Must be A, B, C, or D.'
            });
        }
        // Find the selected partner and calculate score
        const selectedPartner = round1Data_1.PARTNERS.find(p => p.id === partnerId);
        if (!selectedPartner) {
            return res.status(400).json({
                error: 'Partner not found'
            });
        }
        // Reuse ranking computation for the selected partner
        const computeScore = (p) => {
            const dummyReq = {};
            const normalize = (value, min, max, invert = false) => {
                const clamped = Math.max(min, Math.min(max, value));
                const norm = (clamped - min) / (max - min);
                return invert ? 1 - norm : norm;
            };
            const c = p.criteria;
            const minDays = Math.min(...round1Data_1.PARTNERS.map(pp => pp.criteria.speedOfOnboardingDays));
            const maxDays = Math.max(...round1Data_1.PARTNERS.map(pp => pp.criteria.speedOfOnboardingDays));
            const minCost = Math.min(...round1Data_1.PARTNERS.map(pp => pp.criteria.costPerPatient));
            const maxCost = Math.max(...round1Data_1.PARTNERS.map(pp => pp.criteria.costPerPatient));
            const minCoverage = Math.min(...round1Data_1.PARTNERS.map(pp => pp.criteria.networkCoverage));
            const maxCoverage = Math.max(...round1Data_1.PARTNERS.map(pp => pp.criteria.networkCoverage));
            const parts = {
                speedOfOnboarding: normalize(c.speedOfOnboardingDays, minDays, maxDays, true) * round1Data_1.STRATEGIC_PRIORITIES.speedOfOnboarding,
                moHCoordination: normalize(c.moHCoordinationScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.moHCoordination,
                dataReporting: normalize(c.dataReportingScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.dataReporting,
                coldChainInfra: normalize(c.coldChainInfraScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.coldChainInfra,
                communityTrust: normalize(c.communityTrustScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.communityTrust,
                scalabilityYear2: normalize(c.scalabilityYear2Score, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.scalabilityYear2,
                biologicsExperience: normalize(c.biologicsExperienceScore, 1, 10, false) * round1Data_1.STRATEGIC_PRIORITIES.biologicsExperience,
                mediaPoliticalRisk: normalize(c.mediaPoliticalRiskScore, 1, 10, true) * round1Data_1.STRATEGIC_PRIORITIES.mediaPoliticalRisk,
                networkCoverage: normalize(c.networkCoverage, minCoverage, maxCoverage, false) * round1Data_1.STRATEGIC_PRIORITIES.networkCoverage,
                costPerPatient: normalize(c.costPerPatient, minCost, maxCost, true) * round1Data_1.STRATEGIC_PRIORITIES.costPerPatient,
            };
            return Object.values(parts).reduce((s, v) => s + v, 0) * round1Data_1.MAX_PARTNER_SCORE;
        };
        const score = computeScore(selectedPartner);
        // Get user's current session
        const userSession = await prisma.userSession.findFirst({
            where: { userId },
            include: { session: true }
        });
        if (!userSession) {
            return res.status(400).json({
                error: 'User not in an active session'
            });
        }
        // Check if user already made a selection
        const existingSelection = await prisma.partnerSelection.findFirst({
            where: {
                userId,
                sessionId: userSession.sessionId
            }
        });
        if (existingSelection) {
            return res.status(400).json({
                error: 'Partner selection already submitted'
            });
        }
        // Save the selection
        const partnerSelection = await prisma.partnerSelection.create({
            data: {
                userId,
                sessionId: userSession.sessionId,
                partnerId,
                score
            }
        });
        res.json({
            success: true,
            selection: {
                partnerId,
                partnerName: selectedPartner.name,
                score,
                selectedAt: partnerSelection.selectedAt
            }
        });
    }
    catch (error) {
        console.error('Submit partner selection error:', error);
        res.status(500).json({
            error: 'Internal server error while submitting partner selection'
        });
    }
};
exports.submitPartnerSelection = submitPartnerSelection;
const getPartnerSelection = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }
        const userSession = await prisma.userSession.findFirst({
            where: { userId },
            include: { session: true }
        });
        if (!userSession) {
            return res.status(400).json({
                error: 'User not in an active session'
            });
        }
        const selection = await prisma.partnerSelection.findFirst({
            where: {
                userId,
                sessionId: userSession.sessionId
            }
        });
        if (!selection) {
            return res.json({
                success: true,
                selection: null
            });
        }
        const selectedPartner = round1Data_1.PARTNERS.find(p => p.id === selection.partnerId);
        res.json({
            success: true,
            selection: {
                partnerId: selection.partnerId,
                partnerName: selectedPartner?.name,
                score: selection.score,
                selectedAt: selection.selectedAt
            }
        });
    }
    catch (error) {
        console.error('Get partner selection error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching partner selection'
        });
    }
};
exports.getPartnerSelection = getPartnerSelection;
//# sourceMappingURL=partnerSelectionController.js.map