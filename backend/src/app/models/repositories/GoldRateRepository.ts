import GoldRate, { IGoldRate } from '../entities/GoldRate';
import { Types } from 'mongoose';

// Import pagination interfaces from MemberRepository
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

/**
 * GOLD RATE REPOSITORY
 *
 * Data access layer for gold rates
 * Key feature: deactivateAll() ensures only one active rate at a time
 */

export class GoldRateRepository {
    /**
     * Find the current active gold rate
     * @returns The active gold rate or null
     */
    static async findActive(): Promise<IGoldRate | null> {
        return await GoldRate.findOne({ isActive: true })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 }); // Most recent if multiple
    }

    /**
     * Find all historical rates (paginated)
     * @param options Pagination options
     * @returns Paginated list of gold rates
     */
    static async findAll(
        options: PaginationOptions
    ): Promise<PaginatedResult<IGoldRate>> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [rates, total] = await Promise.all([
            GoldRate.find()
                .populate('createdBy', 'name email')
                .skip(skip)
                .limit(limit)
                .sort(sort),
            GoldRate.countDocuments(),
        ]);

        const pages = Math.ceil(total / limit);

        return {
            data: rates,
            pagination: {
                page,
                limit,
                total,
                pages,
            },
        };
    }

    /**
     * Find a specific gold rate by ID
     * @param id Gold rate ID
     * @returns The gold rate or null
     */
    static async findById(id: string): Promise<IGoldRate | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return await GoldRate.findById(id).populate('createdBy', 'name email');
    }

    /**
     * CRITICAL: Deactivate all existing rates
     * This ensures only one active rate at a time
     * Called before creating a new rate
     */
    static async deactivateAll(): Promise<void> {
        await GoldRate.updateMany({ isActive: true }, { isActive: false });
    }

    /**
     * Create a new gold rate
     * @param rateData Gold rate data
     * @returns The created gold rate
     */
    static async create(rateData: {
        buyPrice: number;
        sellPrice: number;
        createdBy: Types.ObjectId;
        effectiveDate?: Date;
    }): Promise<IGoldRate> {
        const rate = await GoldRate.create(rateData);

        // Populate after create
        const populatedRate = await GoldRate.findById(rate._id).populate(
            'createdBy',
            'name email'
        );

        return populatedRate as IGoldRate;
    }

    /**
     * Count total gold rates
     * @param filter Optional filter criteria
     * @returns Total count
     */
    static async count(filter: any = {}): Promise<number> {
        return await GoldRate.countDocuments(filter);
    }
}

export default GoldRateRepository;
