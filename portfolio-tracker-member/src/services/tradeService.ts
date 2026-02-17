import api from './api';

/**
 * Trade Service
 *
 * Handles all trade-related API calls for members
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

/**
 * Trade Interface
 */
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

/**
 * Paginated Trades Response
 */
export interface PaginatedTrades {
    data: Trade[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

/**
 * Create Trade DTO
 */
export interface CreateTradeDto {
    memberId: string;
    tradeType: TradeType;
    quantity: number;
    notes?: string;
}

const tradeService = {
    /**
     * Get my trades (current logged-in member)
     *
     * @param page - Page number
     * @param limit - Items per page
     * @returns Paginated trades
     */
    getMyTrades: async (page: number = 1, limit: number = 100): Promise<PaginatedTrades> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });

        const response = await api.get<PaginatedTrades>(`/trades/my-trades?${params.toString()}`);
        return response.data;
    },

    /**
     * Create a new SELL trade (member can only create SELL trades)
     *
     * @param tradeData - Trade data
     * @returns Created trade
     */
    createSellTrade: async (tradeData: {
        quantity: number;
        notes?: string;
    }): Promise<Trade> => {
        // Get member ID from localStorage
        const memberData = localStorage.getItem('memberData');
        if (!memberData) {
            throw new Error('Member data not found. Please login again.');
        }

        const member = JSON.parse(memberData);

        const createDto: CreateTradeDto = {
            memberId: member.id,
            tradeType: TradeType.SELL,
            quantity: tradeData.quantity,
            notes: tradeData.notes,
        };

        const response = await api.post<Trade>('/trades', createDto);
        return response.data;
    },

    /**
     * Get trade by ID
     *
     * @param id - Trade ID
     * @returns Trade details
     */
    getTradeById: async (id: string): Promise<Trade> => {
        const response = await api.get<Trade>(`/trades/${id}`);
        return response.data;
    },
};

export default tradeService;
