import { IsNotEmpty, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';

/**
 * GOLD RATE DTOs
 *
 * Data Transfer Objects for gold rate validation
 */

/**
 * DTO for creating a new gold rate
 */
export class CreateGoldRateDto {
    @IsNotEmpty({ message: 'Buy price is required' })
    @IsNumber({}, { message: 'Buy price must be a number' })
    @Min(0, { message: 'Buy price must be positive' })
    buyPrice: number;

    @IsNotEmpty({ message: 'Sell price is required' })
    @IsNumber({}, { message: 'Sell price must be a number' })
    @Min(0, { message: 'Sell price must be positive' })
    sellPrice: number;

    @IsOptional()
    @IsDateString({}, { message: 'Effective date must be a valid date' })
    effectiveDate?: string;
}

/**
 * DTO for querying gold rates (pagination)
 */
export class GoldRateQueryDto {
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
}
