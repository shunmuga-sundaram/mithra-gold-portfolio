import { Schema, model, Document, Types } from 'mongoose';

/**
 * TRADE ENTITY
 *
 * Represents gold buy/sell transactions
 * - BUY: Admin creates trade, member receives gold
 * - SELL: Member initiates or admin creates, member gives gold for cash
 */

export enum TradeType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export enum TradeStatus {
    PENDING = 'PENDING', // Waiting for admin approval (SELL only)
    COMPLETED = 'COMPLETED', // Trade completed
    CANCELLED = 'CANCELLED', // Trade cancelled
}

export interface ITrade extends Document {
    _id: Types.ObjectId;
    memberId: Types.ObjectId; // Member involved in trade
    tradeType: TradeType; // BUY or SELL
    quantity: number; // Grams of gold
    rateAtTrade: number; // Gold rate at time of trade (INR per gram)
    totalAmount: number; // quantity × rateAtTrade
    status: TradeStatus; // PENDING, COMPLETED, CANCELLED
    goldRateId: Types.ObjectId; // Reference to gold rate used
    initiatedBy: Types.ObjectId; // Admin or Member who created
    approvedBy?: Types.ObjectId; // Admin who approved (for SELL)
    notes?: string; // Optional notes
    createdAt: Date;
    updatedAt: Date;
}

const TradeSchema = new Schema<ITrade>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: [true, 'Member is required'],
            index: true, // Fast queries by member
        },
        tradeType: {
            type: String,
            enum: Object.values(TradeType),
            required: [true, 'Trade type is required'],
            index: true, // Fast queries by type
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0.001, 'Quantity must be at least 0.001 grams'],
        },
        rateAtTrade: {
            type: Number,
            required: [true, 'Rate at trade is required'],
            min: [0, 'Rate must be positive'],
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount must be positive'],
        },
        status: {
            type: String,
            enum: Object.values(TradeStatus),
            default: TradeStatus.COMPLETED,
            index: true, // Fast queries by status
        },
        goldRateId: {
            type: Schema.Types.ObjectId,
            ref: 'GoldRate',
            required: [true, 'Gold rate reference is required'],
        },
        initiatedBy: {
            type: Schema.Types.ObjectId,
            refPath: 'initiatedByModel',
            required: [true, 'Initiator is required'],
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
        collection: 'trades',
        versionKey: '__v',
    }
);

// Compound index for efficient queries
TradeSchema.index({ memberId: 1, createdAt: -1 }); // Member's trades sorted by date
TradeSchema.index({ status: 1, createdAt: -1 }); // Trades by status sorted by date
TradeSchema.index({ tradeType: 1, createdAt: -1 }); // Trades by type sorted by date

// Transform for JSON output
TradeSchema.set('toJSON', {
    transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const Trade = model<ITrade>('Trade', TradeSchema);
export default Trade;
