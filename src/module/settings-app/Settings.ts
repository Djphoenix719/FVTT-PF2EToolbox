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

import { MODULE_NAME } from '../Constants';
import '../../external/settings-extender.js';

const Features = {
    DISABLE_PFS_TAB: 'DISABLE_PFS_TAB',
    FLATTEN_PROFICIENCY: 'FLATTEN_PROFICIENCY',
    HERO_POINTS: 'ENABLE_HERO_POINTS',
    LOOT_APP: 'ENABLE_LOOT_APP',
    NPC_SCALER: 'ENABLE_NPC_SCALER',
    QUANTITIES: 'ENABLE_QUANTITIES',
    QUICK_MYSTIFY: 'ENABLE_QUICK_MYSTIFY',
    QUICK_VIEW_SCENE: 'ENABLE_QUICK_VIEW_SCENE',
    REMOVE_DEFAULT_ART: 'REMOVE_DEFAULT_ART',
    ROLL_APP: 'ENABLE_ROLL_APP',
    TOKEN_SETUP: 'ENABLE_TOKEN_SETUP',
};

interface FeatureDefine {
    name: string;
    hint?: string;
    scope?: 'world' | 'client' | 'user';
    type?: BooleanConstructor;
    default?: Boolean;
    config?: Boolean;
    restricted?: Boolean;
}

type FeatureDefines = {
    [P in keyof typeof Features]: FeatureDefine;
};

export default class Settings {
    public static readonly FEATURES = Features;
    public static readonly FEATURE_DEFINES: FeatureDefines = {
        DISABLE_PFS_TAB: {
            name: 'Disable PFS Tab',
            default: false,
        },
        FLATTEN_PROFICIENCY: {
            name: 'Enable Flatten Proficiency',
        },
        HERO_POINTS: {
            name: 'Enable Hero Points',
        },
        LOOT_APP: {
            name: 'Enable Loot App',
            hint: 'Ensure no actors are using the new loot sheet before disabling. Setting only applied on page reload.',
        },
        NPC_SCALER: {
            name: 'Enable NPC Scaler',
        },
        QUANTITIES: {
            name: 'Enable Quick Quantities',
        },
        QUICK_MYSTIFY: {
            name: 'Enable Quick Mystify',
        },
        QUICK_VIEW_SCENE: {
            name: 'Enable Quick View Scene',
        },
        REMOVE_DEFAULT_ART: {
            name: 'Remove Default Art',
        },
        ROLL_APP: {
            name: 'Enable Roll App',
        },
        TOKEN_SETUP: {
            name: 'Enable Token Setup',
        },
    };

    public static readonly MAX_HERO_POINTS = 'MAX_HERO_POINTS';
    public static readonly SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
    public static readonly CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';

    public static readonly SCALED_FOLDER = 'SCALED_FOLDER_NAME';

    public static readonly TOKEN_PATH = 'TOKEN_FOLDER_PATH';
    public static readonly TOKEN_TARGET = 'TOKEN_FOLDER_TARGET';
    public static readonly TOKEN_TARGET_BUCKET = 'TOKEN_FOLDER_TARGET_BUCKET';

    public static readonly LAST_SEEN_SYSTEM = 'LAST_SEEN_VERSION';

    public static get<T = any>(key: string): T {
        return game.settings.get(MODULE_NAME, key) as T;
    }

    public static async set(key: string, value: any) {
        return game.settings.set(MODULE_NAME, key, value);
    }

    public static reg(key: string, value: any) {
        game.settings.register(MODULE_NAME, key, value);
    }

    public static registerAllSettings() {
        const types = window['Azzu'].SettingsTypes;

        const defaultFeatureDefine = {
            hint: 'Setting only applied on page reload.',
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
            restricted: true,
        };

        for (const [index, key] of Object.entries(Settings.FEATURES)) {
            const define = {
                ...defaultFeatureDefine,
                ...Settings.FEATURE_DEFINES[index],
            };

            Settings.reg(key, define);
        }

        Settings.reg(Settings.MAX_HERO_POINTS, {
            name: 'Maximum Hero Points',
            scope: 'world',
            type: Number,
            default: 3,
            config: true,
            restricted: true,
        });

        Settings.reg(Settings.SHIFT_QUANTITY, {
            name: 'Shift Quantity Multiplier',
            scope: 'world',
            type: Number,
            default: 5,
            config: true,
            restricted: true,
        });
        Settings.reg(Settings.CONTROL_QUANTITY, {
            name: 'Control Quantity Multiplier',
            scope: 'world',
            type: Number,
            default: 10,
            config: true,
            restricted: true,
        });

        Settings.reg(Settings.SCALED_FOLDER, {
            name: 'Scaled NPC Folder',
            scope: 'world',
            type: String,
            default: '',
            config: true,
            restricted: true,
        });

        Settings.reg(Settings.TOKEN_TARGET, {
            name: 'Token Folder Target',
            hint: 'Either "data" or "s3".',
            scope: 'world',
            type: String,
            default: 'data',
            config: false,
            restricted: true,
        });
        Settings.reg(Settings.TOKEN_TARGET_BUCKET, {
            name: 'S3 Bucket',
            hint: 'Only needed when Token Folder Target is "s3".',
            scope: 'world',
            type: String,
            default: 'data',
            config: false,
            restricted: true,
        });

        Settings.reg(Settings.TOKEN_PATH, {
            name: 'True Token Folder Path',
            scope: 'world',
            type: String,
            default: '',
            config: false,
            restricted: true,
        });

        Settings.reg(`${Settings.TOKEN_PATH}_CLIENT_FACING`, {
            name: 'Token Folder Path',
            hint:
                'Select any file in the target directory. Note S3 buckets do not work with wildcard ?s due ' +
                'to limitations of Foundry, and will use Image_01.png instead.',
            scope: 'world',
            type: types.FilePickerImage,
            default: '',
            config: true,
            restricted: true,
            onChange: (value: string) => {
                const parts = value.split('/');
                parts.pop();

                value = parts.join('/');
                // @ts-ignore
                const parsedS3URL = FilePicker.parseS3URL(value);

                if (parsedS3URL.bucket !== null) {
                    Settings.set(Settings.TOKEN_TARGET_BUCKET, parsedS3URL.bucket);
                    Settings.set(Settings.TOKEN_TARGET, 's3');
                    Settings.set(Settings.TOKEN_PATH, value);
                } else {
                    Settings.set(Settings.TOKEN_TARGET, 'data');
                    Settings.set(Settings.TOKEN_PATH, value);
                }
            },
        });

        Settings.reg(`${Settings.LAST_SEEN_SYSTEM}`, {
            name: 'Last Seen System Version',
            scope: 'world',
            type: String,
            default: '',
            config: false,
            restricted: true,
        });
    }
}
