export interface Player {
    id: string;
    name: string;
    balance: number;
    company: Company;
    createdAt: Date;
    updatedAt: Date;
}
export interface Company {
    id: string;
    name: string;
    industry: Industry;
    products: Product[];
    employees: Employee[];
    facilities: Facility[];
    marketing: Marketing;
    research: Research;
    createdAt: Date;
    updatedAt: Date;
}
export interface Product {
    id: string;
    name: string;
    price: number;
    cost: number;
    quality: number;
    demand: number;
    supply: number;
    marketingBudget: number;
    researchLevel: number;
}
export interface Employee {
    id: string;
    name: string;
    position: Position;
    salary: number;
    productivity: number;
    satisfaction: number;
    skills: Skill[];
}
export interface Facility {
    id: string;
    name: string;
    type: FacilityType;
    capacity: number;
    efficiency: number;
    maintenanceCost: number;
    location: string;
}
export interface MarketingCampaign {
    id: string;
    name: string;
    budget: number;
    targetAudience: string;
    effectiveness: number;
    startDate: Date;
    endDate: Date;
}
export interface ResearchProject {
    id: string;
    name: string;
    budget: number;
    progress: number;
    expectedCompletion: Date;
    potentialImpact: number;
}
export interface Marketing {
    budget: number;
    campaigns: MarketingCampaign[];
    brandAwareness: number;
    customerSatisfaction: number;
}
export interface Research {
    budget: number;
    projects: ResearchProject[];
    technologyLevel: number;
    innovationScore: number;
}
export declare enum Industry {
    TECHNOLOGY = "technology",
    MANUFACTURING = "manufacturing",
    RETAIL = "retail",
    HEALTHCARE = "healthcare",
    FINANCE = "finance",
    ENTERTAINMENT = "entertainment"
}
export declare enum Position {
    CEO = "ceo",
    CTO = "cto",
    CFO = "cfo",
    MANAGER = "manager",
    DEVELOPER = "developer",
    SALES = "sales",
    MARKETING = "marketing",
    RESEARCH = "research"
}
export declare enum Skill {
    LEADERSHIP = "leadership",
    TECHNICAL = "technical",
    SALES = "sales",
    MARKETING = "marketing",
    RESEARCH = "research",
    MANAGEMENT = "management"
}
export declare enum FacilityType {
    OFFICE = "office",
    FACTORY = "factory",
    WAREHOUSE = "warehouse",
    LABORATORY = "laboratory",
    STORE = "store"
}
export interface GameEvent {
    id: string;
    type: GameEventType;
    title: string;
    description: string;
    impact: GameEventImpact;
    duration: number;
    createdAt: Date;
}
export declare enum GameEventType {
    MARKET_CRASH = "market_crash",
    BOOM = "boom",
    COMPETITION = "competition",
    INNOVATION = "innovation",
    REGULATION = "regulation",
    NATURAL_DISASTER = "natural_disaster"
}
export interface GameEventImpact {
    type: 'positive' | 'negative' | 'neutral';
    magnitude: number;
    affectedIndustries: Industry[];
    description: string;
}
export interface SocketEvents {
    'player:join': (playerId: string) => void;
    'player:update': (player: Partial<Player>) => void;
    'company:action': (action: CompanyAction) => void;
    'game:request': (request: GameRequest) => void;
    'game:update': (gameState: GameState) => void;
    'player:update-response': (player: Player) => void;
    'event:new': (event: GameEvent) => void;
    'notification': (notification: Notification) => void;
}
export interface CompanyAction {
    type: 'hire' | 'fire' | 'invest' | 'research' | 'marketing' | 'expand';
    data: any;
}
export interface GameRequest {
    type: 'market_data' | 'competitor_info' | 'financial_report';
    data?: any;
}
export interface GameState {
    players: Player[];
    events: GameEvent[];
    marketData: MarketData;
    gameTime: Date;
}
export interface MarketData {
    industries: Record<Industry, IndustryData>;
    globalEconomy: EconomyData;
}
export interface IndustryData {
    demand: number;
    supply: number;
    averagePrice: number;
    growthRate: number;
    competition: number;
}
export interface EconomyData {
    gdp: number;
    inflation: number;
    interestRate: number;
    unemployment: number;
}
export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
//# sourceMappingURL=index.d.ts.map