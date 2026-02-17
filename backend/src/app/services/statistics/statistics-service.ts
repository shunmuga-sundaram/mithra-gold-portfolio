import { MemberRepository } from '../../models/repositories/MemberRepository';
import { TradeRepository } from '../../models/repositories/TradeRepository';
import { TradeType, TradeStatus } from '../../models/entities/Trade';

/**
 * Statistics Service
 *
 * Provides dashboard statistics for admin
 */

export interface DashboardStatistics {
    totalMembers: number;
    totalGoldHoldings: number;
    pendingSellRequests: number;
}

export class StatisticsService {
    /**
     * Get dashboard statistics
     *
     * @returns Dashboard statistics including member count, total gold holdings, and pending sell requests
     */
    static async getDashboardStatistics(): Promise<DashboardStatistics> {
        // Get all members to calculate total count and sum gold holdings
        // Use a large limit to get all members (or we could call count separately)
        const membersResult = await MemberRepository.findAll({ page: 1, limit: 10000 });
        const members = membersResult.data;

        const totalMembers = membersResult.pagination.total;
        const totalGoldHoldings = members.reduce((sum, member) => sum + (member.goldHoldings || 0), 0);

        // Get pending sell requests count
        const pendingSellRequests = await TradeRepository.count({
            tradeType: TradeType.SELL,
            status: TradeStatus.PENDING,
        });

        return {
            totalMembers,
            totalGoldHoldings,
            pendingSellRequests,
        };
    }
}
