import { Schema, model, Document, Types } from 'mongoose';

/**
 * GOLD RATE ENTITY
 *
 * Stores gold buy and sell prices
 * Only one rate is active at a time - the most recent entry
 * Previous rates are historical records
 */

export interface IGoldRate extends Document {
    _id: Types.ObjectId;
    buyPrice: number; // INR per gram
    sellPrice: number; // INR per gram
    isActive: boolean; // Only one should be true at a time
    effectiveDate: Date; // When this rate became effective
    createdBy: Types.ObjectId; // Reference to Admin who created it
    createdAt: Date;
    updatedAt: Date;
}

const GoldRateSchema = new Schema<IGoldRate>(
    {
        buyPrice: {
            type: Number,
            required: [true, 'Buy price is required'],
            min: [0, 'Buy price must be positive'],
        },
        sellPrice: {
            type: Number,
            required: [true, 'Sell price is required'],
            min: [0, 'Sell price must be positive'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        effectiveDate: {
            type: Date,
            default: Date.now,
            index: true, // Index for fast queries by date
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: [true, 'Creator is required'],
        },
    },
    {
        timestamps: true, // Auto-manage createdAt and updatedAt
        collection: 'gold_rates',
        versionKey: '__v',
    }
);

// Index for finding active rate quickly
GoldRateSchema.index({ isActive: 1 });

// Index for historical queries (most recent first)
GoldRateSchema.index({ effectiveDate: -1, createdAt: -1 });

// Transform for JSON output
GoldRateSchema.set('toJSON', {
    transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const GoldRate = model<IGoldRate>('GoldRate', GoldRateSchema);
export default GoldRate;
