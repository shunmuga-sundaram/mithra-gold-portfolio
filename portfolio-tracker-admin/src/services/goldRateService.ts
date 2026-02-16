import api from './api';

/**
 * GOLD RATE SERVICE
 *
 * Frontend service for gold rate management
 */

export interface GoldRate {
    id: string;
    buyPrice: number;
    sellPrice: number;
    isActive: boolean;
    effectiveDate: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateGoldRateDto {
    buyPrice: number;
    sellPrice: number;
    effectiveDate?: string;
}

export interface PaginatedGoldRates {
    data: GoldRate[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface GoldRateStatistics {
    activeRate: {
        buyPrice: number;
        sellPrice: number;
        effectiveDate: string;
    } | null;
    totalHistoricalRates: number;
    hasActiveRate: boolean;
}

const goldRateService = {
    /**
     * Get current active gold rate
     */
    getActiveRate: async (): Promise<GoldRate> => {
        const response = await api.get<GoldRate>('/gold-rates/active');
        return response.data;
    },

    /**
     * Get all historical gold rates (paginated)
     */
    getAllRates: async (page: number = 1, limit: number = 10): Promise<PaginatedGoldRates> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });

        const response = await api.get<PaginatedGoldRates>(`/gold-rates?${params.toString()}`);
        return response.data;
    },

    /**
     * Get specific gold rate by ID
     */
    getRateById: async (id: string): Promise<GoldRate> => {
        const response = await api.get<GoldRate>(`/gold-rates/${id}`);
        return response.data;
    },

    /**
     * Create new gold rate
     * This will automatically deactivate all previous rates
     */
    createRate: async (rateData: CreateGoldRateDto): Promise<GoldRate> => {
        const response = await api.post<GoldRate>('/gold-rates', rateData);
        return response.data;
    },

    /**
     * Get gold rate statistics
     */
    getStatistics: async (): Promise<GoldRateStatistics> => {
        const response = await api.get<GoldRateStatistics>('/gold-rates/statistics');
        return response.data;
    }
};

export default goldRateService;
