import { Schema, model, Document } from 'mongoose';

/**
 * APP SETTINGS ENTITY
 *
 * Global application configuration stored as a single document.
 * Only one document exists in this collection (singleton pattern).
 */

export interface IAppSettings extends Document {
    showPortfolioValue: boolean;
    updatedAt: Date;
}

const AppSettingsSchema = new Schema<IAppSettings>(
    {
        showPortfolioValue: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: 'app_settings',
    }
);

AppSettingsSchema.set('toJSON', {
    transform: function (doc: any, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const AppSettings = model<IAppSettings>('AppSettings', AppSettingsSchema);
export default AppSettings;
