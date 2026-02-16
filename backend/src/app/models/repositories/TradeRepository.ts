import Trade, { ITrade, TradeType, TradeStatus } from '../entities/Trade';
import { Types } from 'mongoose';

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

export interface TradeFilterOptions extends PaginationOptions {
    memberId?: string;
    tradeType?: TradeType;
    status?: TradeStatus;
    startDate?: Date;
    endDate?: Date;
}

/**
 * TRADE REPOSITORY
 *
 * Data access layer for trades
 */

export class TradeRepository {
    /**
     * Find all trades with filters and pagination
     */
    static async findAll(options: TradeFilterOptions): Promise<PaginatedResult<ITrade>> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            memberId,
            tradeType,
            status,
            startDate,
            endDate,
        } = options;

        const skip = (page - 1) * limit;
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Build filter query
        const filter: any = {};

        if (memberId) {
            filter.memberId = new Types.ObjectId(memberId);
        }

        if (tradeType) {
            filter.tradeType = tradeType;
        }

        if (status) {
            filter.status = status;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = startDate;
            }
            if (endDate) {
                filter.createdAt.$lte = endDate;
            }
        }

        const [trades, total] = await Promise.all([
            Trade.find(filter)
                .populate('memberId', 'name email goldHoldings')
                .populate('goldRateId', 'buyPrice sellPrice')
                .populate('initiatedBy', 'name email')
                .populate('approvedBy', 'name email')
                .skip(skip)
                .limit(limit)
                .sort(sort),
            Trade.countDocuments(filter),
        ]);

        const pages = Math.ceil(total / limit);

        return {
            data: trades,
            pagination: {
                page,
                limit,
                total,
                pages,
            },
        };
    }

    /**
     * Find trades by member ID
     */
    static async findByMemberId(
        memberId: string,
        options: PaginationOptions
    ): Promise<PaginatedResult<ITrade>> {
        return this.findAll({ ...options, memberId });
    }

    /**
     * Find trade by ID
     */
    static async findById(id: string): Promise<ITrade | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        return await Trade.findById(id)
            .populate('memberId', 'name email goldHoldings')
            .populate('goldRateId', 'buyPrice sellPrice')
            .populate('initiatedBy', 'name email')
            .populate('approvedBy', 'name email');
    }

    /**
     * Create new trade
     */
    static async create(tradeData: {
        memberId: Types.ObjectId;
        tradeType: TradeType;
        quantity: number;
        rateAtTrade: number;
        totalAmount: number;
        status: TradeStatus;
        goldRateId: Types.ObjectId;
        initiatedBy: Types.ObjectId;
        notes?: string;
    }): Promise<ITrade> {
        const trade = await Trade.create(tradeData);

        // Populate after create
        const populatedTrade = await Trade.findById(trade._id)
            .populate('memberId', 'name email goldHoldings')
            .populate('goldRateId', 'buyPrice sellPrice')
            .populate('initiatedBy', 'name email');

        return populatedTrade as ITrade;
    }

    /**
     * Update trade status
     */
    static async updateStatus(
        id: string,
        status: TradeStatus,
        approvedBy?: Types.ObjectId
    ): Promise<ITrade | null> {
        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        const updateData: any = { status };
        if (approvedBy) {
            updateData.approvedBy = approvedBy;
        }

        const trade = await Trade.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('memberId', 'name email goldHoldings')
            .populate('goldRateId', 'buyPrice sellPrice')
            .populate('initiatedBy', 'name email')
            .populate('approvedBy', 'name email');

        return trade;
    }

    /**
     * Count trades by filter
     */
    static async count(filter: any = {}): Promise<number> {
        return await Trade.countDocuments(filter);
    }

    /**
     * Get trade statistics
     */
    static async getStatistics(memberId?: string): Promise<any> {
        const filter: any = {};
        if (memberId) {
            filter.memberId = new Types.ObjectId(memberId);
        }

        const [totalTrades, completedTrades, pendingTrades, buyTrades, sellTrades] =
            await Promise.all([
                Trade.countDocuments(filter),
                Trade.countDocuments({ ...filter, status: TradeStatus.COMPLETED }),
                Trade.countDocuments({ ...filter, status: TradeStatus.PENDING }),
                Trade.countDocuments({ ...filter, tradeType: TradeType.BUY }),
                Trade.countDocuments({ ...filter, tradeType: TradeType.SELL }),
            ]);

        // Calculate total volumes
        const buyVolume = await Trade.aggregate([
            { $match: { ...filter, tradeType: TradeType.BUY, status: TradeStatus.COMPLETED } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalAmount: { $sum: '$totalAmount' } } },
        ]);

        const sellVolume = await Trade.aggregate([
            { $match: { ...filter, tradeType: TradeType.SELL, status: TradeStatus.COMPLETED } },
            { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalAmount: { $sum: '$totalAmount' } } },
        ]);

        return {
            totalTrades,
            completedTrades,
            pendingTrades,
            buyTrades,
            sellTrades,
            buyVolume: buyVolume[0] || { totalQuantity: 0, totalAmount: 0 },
            sellVolume: sellVolume[0] || { totalQuantity: 0, totalAmount: 0 },
        };
    }
}

export default TradeRepository;
