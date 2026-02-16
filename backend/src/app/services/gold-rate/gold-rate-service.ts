import GoldRateRepository, { PaginationOptions } from '../../models/repositories/GoldRateRepository';
import { CreateGoldRateDto } from '../../dtos/gold-rate.dto';
import { Types } from 'mongoose';

/**
 * GOLD RATE SERVICE
 *
 * Business logic for gold rate management
 * Key feature: Ensures only one active rate at a time
 */

export class GoldRateService {
    /**
     * Get the current active gold rate
     * @returns The active gold rate
     * @throws Error if no active rate found
     */
    static async getActiveRate() {
        try {
            const rate = await GoldRateRepository.findActive();

            if (!rate) {
                throw new Error('No active gold rate found. Please create one.');
            }

            return rate;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve active gold rate');
        }
    }

    /**
     * Get all historical rates (paginated)
     * @param options Pagination options
     * @returns Paginated list of gold rates
     */
    static async getAllRates(options: PaginationOptions = { page: 1, limit: 10 }) {
        try {
            return await GoldRateRepository.findAll(options);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve gold rates');
        }
    }

    /**
     * Get a specific historical rate by ID
     * @param id Gold rate ID
     * @returns The gold rate
     * @throws Error if rate not found
     */
    static async getRateById(id: string) {
        try {
            const rate = await GoldRateRepository.findById(id);

            if (!rate) {
                throw new Error('Gold rate not found');
            }

            return rate;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve gold rate');
        }
    }

    /**
     * Create a new gold rate
     * CRITICAL: Deactivates all existing rates before creating new one
     * This ensures only ONE active rate at any time
     *
     * @param rateData The gold rate data
     * @param adminId The admin creating the rate
     * @returns The newly created gold rate
     */
    static async createRate(rateData: CreateGoldRateDto, adminId: string) {
        try {
            // CRITICAL STEP: Deactivate ALL existing rates
            // This ensures only the new rate will be active
            await GoldRateRepository.deactivateAll();

            // Create new active rate
            const rate = await GoldRateRepository.create({
                buyPrice: rateData.buyPrice,
                sellPrice: rateData.sellPrice,
                createdBy: new Types.ObjectId(adminId),
                effectiveDate: rateData.effectiveDate ? new Date(rateData.effectiveDate) : new Date(),
            });

            return rate;
        } catch (error: any) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(error.message || 'Failed to create gold rate');
        }
    }

    /**
     * Get gold rate statistics
     * @returns Statistics about gold rates
     */
    static async getStatistics() {
        try {
            const [activeRate, totalRates] = await Promise.all([
                GoldRateRepository.findActive(),
                GoldRateRepository.count(),
            ]);

            return {
                activeRate: activeRate ? {
                    buyPrice: activeRate.buyPrice,
                    sellPrice: activeRate.sellPrice,
                    effectiveDate: activeRate.effectiveDate,
                } : null,
                totalHistoricalRates: totalRates,
                hasActiveRate: !!activeRate,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve statistics');
        }
    }
}

export default GoldRateService;
