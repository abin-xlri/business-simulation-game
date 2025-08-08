export interface Company {
    id: string;
    name: string;
    industry: string;
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    revenue: number;
    employees: number;
    location: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=company.d.ts.map