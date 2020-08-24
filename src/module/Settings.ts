import { MODULE_NAME } from './Constants';

export default class Settings {
    public static readonly KEY_MAX_HERO_POINTS = 'MAX_HERO_POINTS';

    public static readonly KEY_SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
    public static readonly KEY_CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';

    public static readonly KEY_PARTY_FOLDER = 'PARTY_FOLDER_NAME';
    public static readonly KEY_SCALED_OUTPUT_FOLDER = 'SCALED_NPC_OUTPUT_FOLDER';

    public static get<T = any>(key: string): T {
        return game.settings.get(MODULE_NAME, key) as T;
    }

    public static async set(key: string, value: any) {
        return game.settings.set(MODULE_NAME, key, value);
    }

    public static reg(key: string, value: any) {
        game.settings.register(MODULE_NAME, key, value);
    }
}
