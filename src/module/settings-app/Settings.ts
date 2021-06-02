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
import SettingsApp from './SettingsApp';

const Features = {
    CREATURE_BUILDER: 'CREATURE_BUILDER',
    FLATTEN_PROFICIENCY: 'FLATTEN_PROFICIENCY',
    HERO_POINTS: 'ENABLE_HERO_POINTS',
    LOOT_APP: 'ENABLE_LOOT_APP',
    NPC_SCALER: 'ENABLE_NPC_SCALER',
    QUANTITIES: 'ENABLE_QUANTITIES',
    QUICK_MYSTIFY: 'ENABLE_QUICK_MYSTIFY',
    REMOVE_DEFAULT_ART: 'REMOVE_DEFAULT_ART',
    ROLL_APP: 'ENABLE_ROLL_APP',
    TOKEN_SETUP: 'ENABLE_TOKEN_SETUP',
};

const MAX_HERO_POINTS = 'MAX_HERO_POINTS';
const SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
const CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';

const SCALED_FOLDER = 'SCALED_FOLDER_NAME';

const TOKEN_PATH = 'TOKEN_FOLDER_PATH';
const TOKEN_TARGET = 'TOKEN_FOLDER_TARGET';
const TOKEN_TARGET_BUCKET = 'TOKEN_FOLDER_TARGET_BUCKET';

const LAST_SEEN_SYSTEM = 'LAST_SEEN_VERSION';

const MENU_KEY = 'SETTINGS_MENU';

type IFeatureInputType = 'checkbox' | 'number' | 'text' | 'file';
interface IFeatureAttribute {
    icon: string;
    title: string;
}
interface IFeatureInput {
    name: string;
    label: string;
    type: IFeatureInputType;
    help?: string;
    value: any;
    max?: number;
    min?: number;
}
interface IFeatureRegistration {
    name: string;
    type: BooleanConstructor | NumberConstructor | StringConstructor;
    default: any;
    onChange?: (value: any) => void;
}
interface IFeatureDefinition {
    name: string;
    attributes?: IFeatureAttribute[];
    description: string;
    inputs: IFeatureInput[];
    register: IFeatureRegistration[];
    help?: string;
}

const ATTR_RELOAD_REQUIRED: IFeatureAttribute = {
    icon: 'fas fa-sync',
    title: 'Reload Required',
};
const ATTR_REOPEN_SHEET_REQUIRED: IFeatureAttribute = {
    icon: 'fas fa-sticky-note',
    title: 'Sheets must be closed and re-opened.',
};

export const FEATURES: IFeatureDefinition[] = [
    {
        name: 'Quick Roll App',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `An app with all the data available for monsters in convenient tables that can be clicked to roll.`,
        inputs: [
            {
                name: Features.ROLL_APP,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
        ],
        register: [
            {
                name: Features.ROLL_APP,
                type: Boolean,
                default: true,
            },
        ],
    },
    {
        name: 'Creature Builder',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A tool to build creatures from scratch using the recommended values from the GMG.`,
        inputs: [
            {
                name: Features.CREATURE_BUILDER,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
        ],
        register: [
            {
                name: Features.CREATURE_BUILDER,
                type: Boolean,
                default: true,
            },
        ],
    },
    {
        name: 'Quick Unidentification',
        attributes: [ATTR_RELOAD_REQUIRED],
        description:
            `Holding alt when dragging an item onto a sheet immediately unidentifies it. Also works with the Loot App,` +
            ` where holding alt will unidentify the items created/rolled.`,
        inputs: [
            {
                name: Features.QUICK_MYSTIFY,
                label: 'Enable',
                type: 'checkbox',
                value: false,
            },
        ],
        register: [
            {
                name: Features.QUICK_MYSTIFY,
                type: Boolean,
                default: false,
            },
        ],
    },
    {
        name: 'Remove Default Art',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Each new version of PF2E, will remove default art from all bestiary compendiums.`,

        inputs: [
            {
                name: Features.REMOVE_DEFAULT_ART,
                label: 'Enable',
                type: 'checkbox',
                value: false,
            },
        ],
        register: [
            {
                name: Features.REMOVE_DEFAULT_ART,
                type: Boolean,
                default: false,
            },
        ],
    },
    {
        name: 'Quick Quantities',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Allows you to hold shift or control when increasing/decreasing an item quantity on the player sheet to quickly increase/decrease quantities.`,

        inputs: [
            {
                name: Features.QUANTITIES,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
            {
                name: SHIFT_QUANTITY,
                label: 'Shift Quantity',
                type: 'number',
                value: 5,
            },
            {
                name: CONTROL_QUANTITY,
                label: 'Control Quantity',
                type: 'number',
                value: 10,
            },
        ],
        register: [
            {
                name: Features.QUANTITIES,
                type: Boolean,
                default: true,
            },
            {
                name: SHIFT_QUANTITY,
                type: Number,
                default: 5,
            },
            {
                name: CONTROL_QUANTITY,
                type: Number,
                default: 10,
            },
        ],
    },
    {
        name: 'Flatten Proficiency',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A helper for the "Proficiency without Level" variant rule (GMG 198) will be added to the context menu of NPCs to 
        remove the creatures level from all relevant stats.`,
        inputs: [
            {
                name: Features.FLATTEN_PROFICIENCY,
                label: 'Enable',
                type: 'checkbox',
                value: false,
            },
        ],
        register: [
            {
                name: Features.FLATTEN_PROFICIENCY,
                type: Boolean,
                default: false,
            },
        ],
    },
    {
        name: 'NPC Scaler',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds the ability to scale NPCs to any range of levels to the context menu. Will scale all relevant statistics 
        of the creature, including DCs and damage displayed in ability descriptions.`,
        inputs: [
            {
                name: Features.NPC_SCALER,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
            {
                name: SCALED_FOLDER,
                label: 'Output Folder',
                type: 'text',
                value: '',
            },
        ],
        register: [
            {
                name: Features.NPC_SCALER,
                type: Boolean,
                default: true,
            },
            {
                name: SCALED_FOLDER,
                type: String,
                default: '',
            },
        ],
    },
    {
        name: 'Loot Enhancements',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds a new loot actor sheet with many enhancements such as a treasure roller, magic item creator, and more.`,
        help: `You must set all loot actors back to the default sheet before disabling this option or the actor will not function after
        it is disabled.`,
        inputs: [
            {
                name: Features.LOOT_APP,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
        ],
        register: [
            {
                name: Features.LOOT_APP,
                type: Boolean,
                default: true,
            },
        ],
    },
    {
        name: 'Maximum Hero Points',
        attributes: [ATTR_REOPEN_SHEET_REQUIRED],
        description: `Changes the maximum number of hero points a player can have.`,
        inputs: [
            {
                name: Features.HERO_POINTS,
                label: 'Enable',
                type: 'checkbox',
                value: true,
            },
            {
                name: MAX_HERO_POINTS,
                label: 'Max Hero Points',
                type: 'number',
                value: 3,
                min: 1,
                max: 20,
            },
        ],
        register: [
            {
                name: Features.HERO_POINTS,
                type: Boolean,
                default: true,
            },
            {
                name: MAX_HERO_POINTS,
                type: Number,
                default: 3,
                onChange: (value: number) => {
                    if (value < 1) {
                        Settings.set(MAX_HERO_POINTS, 1);
                    }
                    if (value > 20) {
                        Settings.set(MAX_HERO_POINTS, 20);
                    }
                },
            },
        ],
    },
    {
        name: 'Token Setup Helper',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds a context menu option to setup a token using a pre-defined naming scheme. See the
        <a href="https://github.com/Djphoenix719/FVTT-PF2EToolbox" target="_blank">GitHub</a> for details.`,
        inputs: [
            {
                name: Features.TOKEN_SETUP,
                label: 'Enable',
                type: 'checkbox',
                value: false,
            },
            {
                name: `${TOKEN_PATH}_CLIENT_FACING`,
                label: 'Token Path',
                type: 'file',
                value: '',
                help: 'Choose any file in the target token mapping directory.',
            },
        ],
        register: [
            {
                name: Features.TOKEN_SETUP,
                type: Boolean,
                default: false,
            },
            {
                name: `${TOKEN_PATH}_CLIENT_FACING`,
                type: String,
                default: '',
                onChange: async (value: string) => {
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
            },
            {
                name: TOKEN_PATH,
                type: String,
                default: '',
            },
            {
                name: TOKEN_TARGET,
                type: String,
                default: '',
            },
            {
                name: TOKEN_TARGET_BUCKET,
                type: String,
                default: '',
            },
        ],
    },
];

export default class Settings {
    public static readonly FEATURES = Features;

    public static readonly MAX_HERO_POINTS = MAX_HERO_POINTS;
    public static readonly SHIFT_QUANTITY = SHIFT_QUANTITY;
    public static readonly CONTROL_QUANTITY = CONTROL_QUANTITY;

    public static readonly SCALED_FOLDER = SCALED_FOLDER;

    public static readonly TOKEN_PATH = TOKEN_PATH;
    public static readonly TOKEN_TARGET = TOKEN_TARGET;
    public static readonly TOKEN_TARGET_BUCKET = TOKEN_TARGET_BUCKET;

    public static readonly LAST_SEEN_SYSTEM = LAST_SEEN_SYSTEM;

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
        for (const feature of FEATURES) {
            for (const registration of feature.register) {
                const setting = {
                    name: registration.name,
                    scope: 'world',
                    type: registration.type,
                    default: registration.default,
                    config: false,
                    restricted: true,
                    onChange: registration.onChange,
                };
                Settings.reg(registration.name, setting);
            }
        }

        game.settings.registerMenu(MODULE_NAME, MENU_KEY, {
            name: 'PF2E Toolbox Settings',
            label: 'PF2E Toolbox Settings',
            hint: 'Configure PF2E Toolbox enabled features and other options.',
            icon: 'fas fa-cogs',
            type: SettingsApp,
            restricted: true,
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
