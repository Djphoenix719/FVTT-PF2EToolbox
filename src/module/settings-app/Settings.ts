/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
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
import { setupHeroPoints } from '../features/HeroPoints';
import { setupQuantities } from '../features/QuickQuantities';
import { setupRollApp } from '../features/RollApp';
import { setupNPCScaler } from '../features/NPCScaler';
import { readyDefaultArt } from '../features/DefaultArt';
import { readyQuickUnidentify } from '../features/QuickUnidentify';
import { setupFlattenProficiency } from '../features/FlattenProficiency';
import { setupTokens } from '../features/Tokens';
import { setupCreatureBuilder } from '../creature-builder/CreatureBuilder';
import { readyLootApp } from '../features/LootApp';

// TODO: Localization of strings in this file.

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
type HookCallback = () => void;
interface IFeatureDefinition {
    id: string;
    title: string;
    attributes?: IFeatureAttribute[];
    description: string;
    inputs: IFeatureInput[];
    register: IFeatureRegistration[];
    help?: string;
    onReady?: HookCallback;
    onInit?: HookCallback;
    onSetup?: HookCallback;
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
        id: Features.ROLL_APP,
        title: 'Quick Roll App',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `An app with all the data available for monsters in convenient tables that can be clicked to roll.`,
        inputs: [],
        register: [],
        onSetup: setupRollApp,
    },
    {
        id: Features.CREATURE_BUILDER,
        title: 'Creature Builder',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A tool to build creatures from scratch using the recommended values from the GMG.`,
        inputs: [],
        register: [],
        onSetup: setupCreatureBuilder,
    },
    {
        id: Features.QUICK_MYSTIFY,
        title: 'Quick Unidentification',
        attributes: [ATTR_RELOAD_REQUIRED],
        description:
            `Holding alt when dragging an item onto a sheet immediately unidentifies it. Also works with the Loot App,` +
            ` where holding alt will unidentify the items created/rolled.`,
        inputs: [],
        register: [],
        onReady: readyQuickUnidentify,
    },
    {
        id: Features.REMOVE_DEFAULT_ART,
        title: 'Remove Default Art',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Each new version of PF2E, will remove default art from all bestiary compendiums.`,
        inputs: [],
        register: [],
        onReady: readyDefaultArt,
    },
    {
        id: Features.QUANTITIES,
        title: 'Quick Quantities',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Allows you to hold shift or control when increasing/decreasing an item quantity on the player sheet to quickly increase/decrease quantities.`,
        inputs: [
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
        onSetup: setupQuantities,
    },
    {
        id: Features.FLATTEN_PROFICIENCY,
        title: 'Flatten Proficiency',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A helper for the "Proficiency without Level" variant rule (GMG 198) will be added to the context menu of NPCs to 
        remove the creatures level from all relevant stats.`,
        inputs: [],
        register: [],
        onSetup: setupFlattenProficiency,
    },
    {
        id: Features.NPC_SCALER,
        title: 'NPC Scaler',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds the ability to scale NPCs to any range of levels to the context menu. Will scale all relevant statistics 
        of the creature, including DCs and damage displayed in ability descriptions.`,
        inputs: [
            {
                name: SCALED_FOLDER,
                label: 'Output Folder',
                type: 'text',
                value: '',
            },
        ],
        register: [
            {
                name: SCALED_FOLDER,
                type: String,
                default: '',
            },
        ],
        onSetup: setupNPCScaler,
    },
    {
        id: Features.LOOT_APP,
        title: 'Loot Enhancements',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds a new loot actor sheet with many enhancements such as a treasure roller, magic item creator, and more.`,
        help: `You must set all loot actors back to the default sheet before disabling this option or the actor will not function after
        it is disabled.`,
        inputs: [],
        register: [],
        onReady: readyLootApp,
    },
    {
        id: Features.HERO_POINTS,
        title: 'Maximum Hero Points',
        attributes: [ATTR_REOPEN_SHEET_REQUIRED],
        description: `Changes the maximum number of hero points a player can have.`,
        inputs: [
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
        onSetup: setupHeroPoints,
    },
    {
        id: Features.TOKEN_SETUP,
        title: 'Token Setup Helper',
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
                        await Settings.set(Settings.TOKEN_TARGET_BUCKET, parsedS3URL.bucket);
                        await Settings.set(Settings.TOKEN_TARGET, 's3');
                        await Settings.set(Settings.TOKEN_PATH, value);
                    } else {
                        await Settings.set(Settings.TOKEN_TARGET, 'data');
                        await Settings.set(Settings.TOKEN_PATH, value);
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
        onSetup: setupTokens,
    },
];

export default class Settings {
    public static readonly FEATURES = Features;

    // TODO: Move these to a helper class? Is this already the settings class?
    //  Should they simply be collapsed into a field of the settings class?

    public static readonly MAX_HERO_POINTS = MAX_HERO_POINTS;
    public static readonly SHIFT_QUANTITY = SHIFT_QUANTITY;
    public static readonly CONTROL_QUANTITY = CONTROL_QUANTITY;

    public static readonly SCALED_FOLDER = SCALED_FOLDER;

    public static readonly TOKEN_PATH = TOKEN_PATH;
    public static readonly TOKEN_TARGET = TOKEN_TARGET;
    public static readonly TOKEN_TARGET_BUCKET = TOKEN_TARGET_BUCKET;

    public static readonly LAST_SEEN_SYSTEM = LAST_SEEN_SYSTEM;

    /**
     * Retrieve a setting from the store.
     * @param key They key the setting resides at.
     */
    public static get<T = any>(key: string): T {
        return game.settings.get(MODULE_NAME, key) as T;
    }

    /**
     * Set the value of a setting in the store.
     * @param key The key the setting resides at.
     * @param value The value the setting should be set to.
     */
    public static async set(key: string, value: any) {
        return game.settings.set(MODULE_NAME, key, value);
    }

    /**
     * Register a setting with the store.
     * @param key The key the setting should reside at.
     * @param value The default value of the setting.
     */
    public static reg(key: string, value: any) {
        game.settings.register(MODULE_NAME, key, value);
    }

    /**
     * Binds on init hooks for each feature that has them.
     */
    public static onInit() {
        for (const feature of FEATURES) {
            if (feature.onInit && Settings.get(feature.id)) {
                feature.onInit();
            }
        }
    }

    /**
     * Binds on setup hooks for each feature that has them.
     */
    public static onSetup() {
        for (const feature of FEATURES) {
            if (feature.onSetup && Settings.get(feature.id)) {
                feature.onSetup();
            }
        }
    }

    /**
     * Binds on ready hooks for each feature that has them.
     */
    public static onReady() {
        for (const feature of FEATURES) {
            if (feature.onReady && Settings.get(feature.id)) {
                feature.onReady();
            }
        }
    }

    /**
     * Registers all game settings for the application.
     */
    public static registerAllSettings() {
        for (const feature of FEATURES) {
            // Register the feature toggle
            const enabled = {
                name: feature.id,
                scope: 'world',
                type: Boolean,
                default: false,
                config: false,
                restricted: true,
            };
            Settings.reg(feature.id, enabled);

            // Register any other settings values for a feature.
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

        Settings.reg(Settings.LAST_SEEN_SYSTEM, {
            name: 'Last Seen System Version',
            scope: 'world',
            type: String,
            default: '',
            config: false,
            restricted: true,
        });
    }
}
