export interface Player {
    id: string;
    name: string;
    balance: number;
    company?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=player.d.ts.map