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
        const scores = round1Data_1.PARTNERS.map(partner => {
            const criteria = partner.criteria;
            const breakdown = {
                reach: criteria.reach * round1Data_1.STRATEGIC_PRIORITIES.reach,
                expertise: criteria.expertise * round1Data_1.STRATEGIC_PRIORITIES.expertise,
                cost: criteria.cost * round1Data_1.STRATEGIC_PRIORITIES.cost,
                reliability: criteria.reliability * round1Data_1.STRATEGIC_PRIORITIES.reliability,
                scalability: criteria.scalability * round1Data_1.STRATEGIC_PRIORITIES.scalability,
                innovation: criteria.innovation * round1Data_1.STRATEGIC_PRIORITIES.innovation
            };
            const totalScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
            return {
                partner,
                score: totalScore,
                breakdown
            };
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
        const criteria = selectedPartner.criteria;
        const score = criteria.reach * round1Data_1.STRATEGIC_PRIORITIES.reach +
            criteria.expertise * round1Data_1.STRATEGIC_PRIORITIES.expertise +
            criteria.cost * round1Data_1.STRATEGIC_PRIORITIES.cost +
            criteria.reliability * round1Data_1.STRATEGIC_PRIORITIES.reliability +
            criteria.scalability * round1Data_1.STRATEGIC_PRIORITIES.scalability +
            criteria.innovation * round1Data_1.STRATEGIC_PRIORITIES.innovation;
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