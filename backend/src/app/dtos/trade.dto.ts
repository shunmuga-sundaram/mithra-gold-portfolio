import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsEnum, IsMongoId, Max } from 'class-validator';
import { TradeType, TradeStatus } from '../models/entities/Trade';

/**
 * TRADE DTOs
 *
 * Data Transfer Objects for trade validation
 */

/**
 * DTO for creating a new trade
 */
export class CreateTradeDto {
    @IsNotEmpty({ message: 'Member ID is required' })
    @IsMongoId({ message: 'Invalid member ID' })
    memberId: string;

    @IsNotEmpty({ message: 'Trade type is required' })
    @IsEnum(TradeType, { message: 'Trade type must be either BUY or SELL' })
    tradeType: TradeType;

    @IsNotEmpty({ message: 'Quantity is required' })
    @IsNumber({}, { message: 'Quantity must be a number' })
    @Min(0.001, { message: 'Quantity must be at least 0.001 grams' })
    quantity: number;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;

    @IsOptional()
    @IsNumber({}, { message: 'Validity days must be a number' })
    @Min(1, { message: 'Validity must be at least 1 day' })
    @Max(3650, { message: 'Validity cannot exceed 3650 days' })
    validityDays?: number;

    @IsOptional()
    @IsMongoId({ message: 'Invalid source BUY trade ID' })
    sourceBuyTradeId?: string;
}

/**
 * DTO for updating trade status
 */
export class UpdateTradeStatusDto {
    @IsNotEmpty({ message: 'Status is required' })
    @IsEnum(TradeStatus, { message: 'Status must be PENDING, COMPLETED, or CANCELLED' })
    status: TradeStatus;

    @IsOptional()
    @IsString({ message: 'Notes must be a string' })
    notes?: string;
}

/**
 * DTO for querying trades (filters)
 */
export class TradeQueryDto {
    @IsOptional()
    @IsNumber({}, { message: 'Page must be a number' })
    @Min(1, { message: 'Page must be at least 1' })
    page?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Limit must be a number' })
    @Min(1, { message: 'Limit must be at least 1' })
    limit?: number;

    @IsOptional()
    sortBy?: string;

    @IsOptional()
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    @IsMongoId({ message: 'Invalid member ID' })
    memberId?: string;

    @IsOptional()
    @IsEnum(TradeType, { message: 'Trade type must be BUY or SELL' })
    tradeType?: TradeType;

    @IsOptional()
    @IsEnum(TradeStatus, { message: 'Status must be PENDING, COMPLETED, or CANCELLED' })
    status?: TradeStatus;
}
