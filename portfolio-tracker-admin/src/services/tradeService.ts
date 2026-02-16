import api from './api';

/**
 * TRADE SERVICE
 *
 * Frontend service for trade management
 */

export enum TradeType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export enum TradeStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Trade {
    id: string;
    memberId: {
        id: string;
        name: string;
        email: string;
        goldHoldings: number;
    };
    tradeType: TradeType;
    quantity: number;
    rateAtTrade: number;
    totalAmount: number;
    status: TradeStatus;
    goldRateId: {
        id: string;
        buyPrice: number;
        sellPrice: number;
    };
    initiatedBy: {
        id: string;
        name: string;
        email: string;
    };
    approvedBy?: {
        id: string;
        name: string;
        email: string;
    };
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTradeDto {
    memberId: string;
    tradeType: TradeType;
    quantity: number;
    notes?: string;
}

export interface UpdateTradeStatusDto {
    status: TradeStatus;
    notes?: string;
}

export interface PaginatedTrades {
    data: Trade[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface TradeStatistics {
    totalTrades: number;
    completedTrades: number;
    pendingTrades: number;
    buyTrades: number;
    sellTrades: number;
    buyVolume: {
        totalQuantity: number;
        totalAmount: number;
    };
    sellVolume: {
        totalQuantity: number;
        totalAmount: number;
    };
}

const tradeService = {
    /**
     * Get all trades with filters
     */
    getAllTrades: async (
        page: number = 1,
        limit: number = 10,
        filters?: {
            memberId?: string;
            tradeType?: TradeType;
            status?: TradeStatus;
        }
    ): Promise<PaginatedTrades> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });

        if (filters?.memberId) {
            params.append('memberId', filters.memberId);
        }
        if (filters?.tradeType) {
            params.append('tradeType', filters.tradeType);
        }
        if (filters?.status) {
            params.append('status', filters.status);
        }

        const response = await api.get<PaginatedTrades>(`/trades?${params.toString()}`);
        return response.data;
    },

    /**
     * Get trades for a specific member
     */
    getMemberTrades: async (
        memberId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedTrades> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });

        const response = await api.get<PaginatedTrades>(
            `/trades/member/${memberId}?${params.toString()}`
        );
        return response.data;
    },

    /**
     * Get specific trade by ID
     */
    getTradeById: async (id: string): Promise<Trade> => {
        const response = await api.get<Trade>(`/trades/${id}`);
        return response.data;
    },

    /**
     * Create new trade
     */
    createTrade: async (tradeData: CreateTradeDto): Promise<Trade> => {
        const response = await api.post<Trade>('/trades', tradeData);
        return response.data;
    },

    /**
     * Update trade status (approve/reject)
     */
    updateTradeStatus: async (
        tradeId: string,
        statusData: UpdateTradeStatusDto
    ): Promise<Trade> => {
        const response = await api.patch<Trade>(`/trades/${tradeId}/status`, statusData);
        return response.data;
    },

    /**
     * Get trade statistics
     */
    getStatistics: async (memberId?: string): Promise<TradeStatistics> => {
        const params = memberId ? `?memberId=${memberId}` : '';
        const response = await api.get<TradeStatistics>(`/trades/statistics${params}`);
        return response.data;
    },

    /**
     * Cancel a COMPLETED BUY trade
     */
    cancelTrade: async (tradeId: string): Promise<Trade> => {
        const response = await api.delete<Trade>(`/trades/${tradeId}/cancel`);
        return response.data;
    },
};

export default tradeService;
