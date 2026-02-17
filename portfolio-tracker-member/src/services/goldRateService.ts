import api from './api';

/**
 * Gold Rate Service
 *
 * Handles all gold rate-related API calls for members
 */

/**
 * Gold Rate Interface
 */
export interface GoldRate {
    id: string;
    buyPrice: number;
    sellPrice: number;
    isActive: boolean;
    effectiveDate: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Gold Rate Response Interface
 */
export interface GoldRateResponse {
    success?: boolean;
    data?: GoldRate;
    id?: string;
    buyPrice?: number;
    sellPrice?: number;
    isActive?: boolean;
    effectiveDate?: string;
}

const goldRateService = {
    /**
     * Get active gold rate
     *
     * @returns Active gold rate
     */
    getActiveRate: async (): Promise<GoldRate> => {
        const response = await api.get<GoldRateResponse>('/gold-rates/active');

        // Handle both response formats
        if (response.data.data) {
            return response.data.data;
        }

        // If response is the gold rate itself
        return response.data as GoldRate;
    },
};

export default goldRateService;
