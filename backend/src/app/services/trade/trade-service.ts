import TradeRepository, { TradeFilterOptions } from '../../models/repositories/TradeRepository';
import MemberRepository from '../../models/repositories/MemberRepository';
import GoldRateRepository from '../../models/repositories/GoldRateRepository';
import { CreateTradeDto, UpdateTradeStatusDto } from '../../dtos/trade.dto';
import { TradeType, TradeStatus } from '../../models/entities/Trade';
import { Types } from 'mongoose';

/**
 * TRADE SERVICE
 *
 * Business logic for trade management
 *
 * Key Rules:
 * - BUY trades: Admin only, increases member's goldHoldings
 * - SELL trades: Can be initiated by member (PENDING) or created by admin (COMPLETED)
 * - SELL trades decrease member's goldHoldings when completed
 * - Members must have sufficient goldHoldings for SELL trades
 */

export class TradeService {
    /**
     * Get all trades with filters
     */
    static async getAllTrades(options: TradeFilterOptions) {
        try {
            return await TradeRepository.findAll(options);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve trades');
        }
    }

    /**
     * Get trades for a specific member
     */
    static async getMemberTrades(memberId: string, options: any) {
        try {
            return await TradeRepository.findByMemberId(memberId, options);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve member trades');
        }
    }

    /**
     * Get trade by ID
     */
    static async getTradeById(id: string) {
        try {
            const trade = await TradeRepository.findById(id);

            if (!trade) {
                throw new Error('Trade not found');
            }

            return trade;
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve trade');
        }
    }

    /**
     * Create a new trade
     *
     * BUY: Admin only, immediately COMPLETED, increases goldHoldings
     * SELL:
     *   - If admin creates: immediately COMPLETED, decreases goldHoldings
     *   - If member creates: PENDING, awaits approval
     */
    static async createTrade(
        tradeData: CreateTradeDto,
        initiatorId: string,
        isAdmin: boolean
    ) {
        try {
            // Get member
            const member = await MemberRepository.findById(tradeData.memberId);
            if (!member) {
                throw new Error('Member not found');
            }

            // Get active gold rate
            const goldRate = await GoldRateRepository.findActive();
            if (!goldRate) {
                throw new Error('No active gold rate found. Please set a gold rate first.');
            }

            // Determine rate based on trade type
            const rateAtTrade =
                tradeData.tradeType === TradeType.BUY ? goldRate.buyPrice : goldRate.sellPrice;

            // Calculate total amount
            const totalAmount = tradeData.quantity * rateAtTrade;

            // Validate SELL trade
            if (tradeData.tradeType === TradeType.SELL) {
                if (member.goldHoldings < tradeData.quantity) {
                    throw new Error(
                        `Insufficient gold holdings. Member has ${member.goldHoldings}g but trying to sell ${tradeData.quantity}g`
                    );
                }
            }

            // Determine trade status
            let status: TradeStatus;
            if (tradeData.tradeType === TradeType.BUY) {
                // BUY trades are always COMPLETED (admin only)
                status = TradeStatus.COMPLETED;
            } else {
                // SELL trades
                if (isAdmin) {
                    // Admin can create COMPLETED SELL trades
                    status = TradeStatus.COMPLETED;
                } else {
                    // Member creates PENDING SELL trades (needs approval)
                    status = TradeStatus.PENDING;
                }
            }

            // Create trade
            const trade = await TradeRepository.create({
                memberId: new Types.ObjectId(tradeData.memberId),
                tradeType: tradeData.tradeType,
                quantity: tradeData.quantity,
                rateAtTrade,
                totalAmount,
                status,
                goldRateId: goldRate._id,
                initiatedBy: new Types.ObjectId(initiatorId),
                notes: tradeData.notes,
            });

            // Update member's goldHoldings if trade is COMPLETED
            if (status === TradeStatus.COMPLETED) {
                await this.updateMemberGoldHoldings(tradeData.memberId, tradeData.tradeType, tradeData.quantity);
            }

            return trade;
        } catch (error: any) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(error.message || 'Failed to create trade');
        }
    }

    /**
     * Update trade status (approve/reject SELL trades)
     */
    static async updateTradeStatus(
        tradeId: string,
        statusData: UpdateTradeStatusDto,
        adminId: string
    ) {
        try {
            const trade = await TradeRepository.findById(tradeId);

            if (!trade) {
                throw new Error('Trade not found');
            }

            // Validate status transition
            if (trade.status === TradeStatus.COMPLETED) {
                throw new Error('Cannot modify completed trade');
            }

            if (trade.status === TradeStatus.CANCELLED) {
                throw new Error('Cannot modify cancelled trade');
            }

            // Only PENDING trades can be updated
            if (trade.status !== TradeStatus.PENDING) {
                throw new Error('Only pending trades can be updated');
            }

            // If approving SELL trade, validate member has sufficient gold
            if (statusData.status === TradeStatus.COMPLETED && trade.tradeType === TradeType.SELL) {
                const memberIdStr = typeof trade.memberId === 'object' && (trade.memberId as any)._id
                    ? (trade.memberId as any)._id.toString()
                    : trade.memberId.toString();
                const member = await MemberRepository.findById(memberIdStr);
                if (!member) {
                    throw new Error('Member not found');
                }

                if (member.goldHoldings < trade.quantity) {
                    throw new Error(
                        `Insufficient gold holdings. Member has ${member.goldHoldings}g but trade requires ${trade.quantity}g`
                    );
                }
            }

            // Update trade status
            const updatedTrade = await TradeRepository.updateStatus(
                tradeId,
                statusData.status,
                new Types.ObjectId(adminId)
            );

            if (!updatedTrade) {
                throw new Error('Failed to update trade');
            }

            // Update member's goldHoldings if trade is COMPLETED
            if (statusData.status === TradeStatus.COMPLETED) {
                const memberIdStr = typeof trade.memberId === 'object' && (trade.memberId as any)._id
                    ? (trade.memberId as any)._id.toString()
                    : trade.memberId.toString();
                await this.updateMemberGoldHoldings(
                    memberIdStr,
                    trade.tradeType,
                    trade.quantity
                );
            }

            return updatedTrade;
        } catch (error: any) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(error.message || 'Failed to update trade status');
        }
    }

    /**
     * Cancel a COMPLETED BUY trade
     * Reverses the gold addition and marks trade as CANCELLED
     */
    static async cancelTrade(tradeId: string, adminId: string) {
        try {
            const trade = await TradeRepository.findById(tradeId);

            if (!trade) {
                throw new Error('Trade not found');
            }

            // Validate it's a BUY trade
            if (trade.tradeType !== TradeType.BUY) {
                throw new Error('Only BUY trades can be cancelled');
            }

            // Validate it's COMPLETED
            if (trade.status !== TradeStatus.COMPLETED) {
                throw new Error('Only completed trades can be cancelled');
            }

            // Extract member ID (handle both populated and non-populated cases)
            const memberIdStr = typeof trade.memberId === 'object' && trade.memberId._id
                ? trade.memberId._id.toString()
                : trade.memberId.toString();

            // Get member to validate gold holdings
            const member = await MemberRepository.findById(memberIdStr);
            if (!member) {
                throw new Error('Member not found');
            }

            // Validate member has enough gold to reverse the BUY
            if (member.goldHoldings < trade.quantity) {
                throw new Error(
                    `Cannot cancel: Member only has ${member.goldHoldings}g but trade added ${trade.quantity}g. They may have already sold this gold.`
                );
            }

            // Update trade status to CANCELLED
            const updatedTrade = await TradeRepository.updateStatus(
                tradeId,
                TradeStatus.CANCELLED,
                new Types.ObjectId(adminId)
            );

            if (!updatedTrade) {
                throw new Error('Failed to cancel trade');
            }

            // Reverse the gold addition (subtract the quantity)
            const newGoldHoldings = member.goldHoldings - trade.quantity;
            await MemberRepository.update(memberIdStr, {
                goldHoldings: Math.max(0, newGoldHoldings)
            });

            return updatedTrade;
        } catch (error: any) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(error.message || 'Failed to cancel trade');
        }
    }

    /**
     * Update member's gold holdings based on trade
     * BUY: Increase holdings
     * SELL: Decrease holdings
     */
    private static async updateMemberGoldHoldings(
        memberId: string,
        tradeType: TradeType,
        quantity: number
    ): Promise<void> {
        const member = await MemberRepository.findById(memberId);

        if (!member) {
            throw new Error('Member not found');
        }

        let newGoldHoldings: number;

        if (tradeType === TradeType.BUY) {
            // BUY: Increase holdings
            newGoldHoldings = member.goldHoldings + quantity;
        } else {
            // SELL: Decrease holdings
            newGoldHoldings = member.goldHoldings - quantity;

            // Ensure holdings don't go negative
            if (newGoldHoldings < 0) {
                newGoldHoldings = 0;
            }
        }

        // Update member's gold holdings
        await MemberRepository.update(memberId, { goldHoldings: newGoldHoldings });
    }

    /**
     * Get trade statistics
     */
    static async getStatistics(memberId?: string) {
        try {
            return await TradeRepository.getStatistics(memberId);
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve statistics');
        }
    }
}

export default TradeService;
