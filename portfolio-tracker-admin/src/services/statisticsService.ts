import api from './api';

/**
 * Statistics Service
 *
 * Handles all statistics and analytics-related API calls for admin
 */

/**
 * Dashboard Statistics Interface
 */
export interface DashboardStatistics {
    totalMembers: number;
    totalGoldHoldings: number;
    pendingSellRequests: number;
}

/**
 * Statistics Response Interface
 */
export interface StatisticsResponse extends DashboardStatistics {
    status_code: number;
    message?: string;
}

const statisticsService = {
    /**
     * Get dashboard statistics
     *
     * @returns Dashboard statistics
     */
    getDashboardStatistics: async (): Promise<DashboardStatistics> => {
        const response = await api.get<StatisticsResponse>('/statistics/dashboard');
        return {
            totalMembers: response.data.totalMembers,
            totalGoldHoldings: response.data.totalGoldHoldings,
            pendingSellRequests: response.data.pendingSellRequests,
        };
    },
};

export default statisticsService;
