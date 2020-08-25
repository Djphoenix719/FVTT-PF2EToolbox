/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MODULE_NAME } from './Constants';

export default class Settings {
    public static readonly KEY_MAX_HERO_POINTS = 'MAX_HERO_POINTS';

    public static readonly ENABLED_FEATURES = {
        QUANTITIES: 'ENABLE_QUANTITIES',
        QUICK_VIEW_SCENE: 'ENABLE_QUICK_VIEW_SCENE',
        NPC_SCALER: 'ENABLE_NPC_SCALER',
        TOKEN_SETUP: 'ENABLE_TOKEN_SETUP',
        ROLL_APP: 'ENABLE_ROLL_APP',
        HERO_POINTS: 'ENABLE_HERO_POINTS',
    };

    public static readonly KEY_SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
    public static readonly KEY_CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';

    public static readonly KEY_PARTY_FOLDER = 'PARTY_FOLDER_NAME';
    public static readonly KEY_ENEMY_FOLDER = 'ENEMY_FOLDER_NAME';
    public static readonly KEY_SCALED_FOLDER = 'SCALED_FOLDER_NAME';

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
