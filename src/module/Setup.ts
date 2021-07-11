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

import { setupRollApp } from './features/RollApp';
import { setupCreatureBuilder } from './creature-builder/CreatureBuilder';
import { readyQuickUnidentify } from './features/QuickUnidentify';
import { readyDefaultArt } from './features/DefaultArt';
import { setupQuantities } from './features/QuickQuantities';
import { setupFlattenProficiency } from './features/FlattenProficiency';
import { setupNPCScaler } from './features/NPCScaler';
import { readyLootApp } from './features/LootApp';
import { setupHeroPoints } from './features/HeroPoints';
import { setupTokens } from './features/Tokens';
import ModuleSettings, { ATTR_RELOAD_REQUIRED, ATTR_REOPEN_SHEET_REQUIRED, IFeatureDefinition } from '../../FVTT-Common/src/module/settings-app/ModuleSettings';
import { MODULE_NAME } from './Constants';
import { registerHandlebarsHelpers, registerHandlebarsTemplates } from './Handlebars';
import { fixMaterials, FixMaterials } from './commands/FixMaterials';
import secretSkillRoll from './macros/secret-skill-roll';
import { distributeHeroPoints } from './macros/distribute-hero-points';
import { groupSave, registerGroupSaveHooks } from './macros/group-saves';

export const CREATURE_BUILDER = 'CREATURE_BUILDER';
export const FLATTEN_PROFICIENCY = 'FLATTEN_PROFICIENCY';
export const HERO_POINTS = 'ENABLE_HERO_POINTS';
export const LOOT_APP = 'ENABLE_LOOT_APP';
export const NPC_SCALER = 'ENABLE_NPC_SCALER';
export const QUANTITIES = 'ENABLE_QUANTITIES';
export const QUICK_MYSTIFY = 'ENABLE_QUICK_MYSTIFY';
export const REMOVE_DEFAULT_ART = 'REMOVE_DEFAULT_ART';
export const ROLL_APP = 'ENABLE_ROLL_APP';
export const TOKEN_SETUP = 'ENABLE_TOKEN_SETUP';

export const MAX_HERO_POINTS = 'MAX_HERO_POINTS';
export const SHIFT_QUANTITY = 'QUANTITY_SHIFT_MULTIPLIER';
export const CONTROL_QUANTITY = 'QUANTITY_CONTROL_MULTIPLIER';
export const SCALED_FOLDER = 'SCALED_FOLDER_NAME';
export const TOKEN_PATH = 'TOKEN_FOLDER_PATH';
export const TOKEN_TARGET = 'TOKEN_FOLDER_TARGET';
export const TOKEN_TARGET_BUCKET = 'TOKEN_FOLDER_TARGET_BUCKET';
export const LAST_SEEN_SYSTEM = 'LAST_SEEN_VERSION';

export const MATERIALS_FIXED = 'MATERIALS_FIXED';

export const FEATURES: IFeatureDefinition[] = [
    {
        id: ROLL_APP,
        title: 'Quick Roll App',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `An app with all the data available for monsters in convenient tables that can be clicked to roll.`,
        inputs: [],
        register: [],
        onSetup: setupRollApp,
    },
    {
        id: CREATURE_BUILDER,
        title: 'Creature Builder',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A tool to build creatures from scratch using the recommended values from the GMG.`,
        inputs: [],
        register: [],
        onSetup: setupCreatureBuilder,
    },
    {
        id: QUICK_MYSTIFY,
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
        id: REMOVE_DEFAULT_ART,
        title: 'Remove Default Art',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Each new version of PF2E, will remove default art from all bestiary compendiums.`,
        inputs: [],
        register: [],
        onReady: readyDefaultArt,
    },
    {
        id: QUANTITIES,
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
        id: FLATTEN_PROFICIENCY,
        title: 'Flatten Proficiency',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `A helper for the "Proficiency without Level" variant rule (GMG 198) will be added to the context menu of NPCs to 
        remove the creatures level from all relevant stats.`,
        inputs: [],
        register: [],
        onSetup: setupFlattenProficiency,
    },
    {
        id: NPC_SCALER,
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
        id: LOOT_APP,
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
        id: HERO_POINTS,
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
                name: HERO_POINTS,
                type: Boolean,
                default: true,
            },
            {
                name: MAX_HERO_POINTS,
                type: Number,
                default: 3,
                onChange: (value: number) => {
                    if (value < 1) {
                        ModuleSettings.instance.set(MAX_HERO_POINTS, 1);
                    }
                    if (value > 20) {
                        ModuleSettings.instance.set(MAX_HERO_POINTS, 20);
                    }
                },
            },
        ],
        onSetup: setupHeroPoints,
    },
    {
        id: TOKEN_SETUP,
        title: 'Token Setup Helper',
        attributes: [ATTR_RELOAD_REQUIRED],
        description: `Adds a context menu option to setup a token using a pre-defined naming scheme. See the
        <a href="https://github.com/Djphoenix719/FVTT-PF2EToolbox" target="_blank">GitHub</a> for details.`,
        inputs: [
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
                        await ModuleSettings.instance.set(TOKEN_TARGET_BUCKET, parsedS3URL.bucket);
                        await ModuleSettings.instance.set(TOKEN_TARGET, 's3');
                        await ModuleSettings.instance.set(TOKEN_PATH, value);
                    } else {
                        await ModuleSettings.instance.set(TOKEN_TARGET, 'data');
                        await ModuleSettings.instance.set(TOKEN_PATH, value);
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

export const setup = () => {
    Hooks.on('init', () => {
        ModuleSettings.instance.registerAllSettings(MODULE_NAME, FEATURES);
        ModuleSettings.instance.reg(LAST_SEEN_SYSTEM, {
            name: 'Last Seen System Version',
            scope: 'world',
            type: String,
            default: '',
            config: false,
            restricted: true,
        });
        ModuleSettings.instance.onInit();
    });
    Hooks.on('setup', () => ModuleSettings.instance.onSetup());
    Hooks.on('ready', () => ModuleSettings.instance.onReady());

    Hooks.on('setup', registerHandlebarsTemplates);
    Hooks.on('setup', registerHandlebarsHelpers);

    Hooks.on('ready', async () => {
        ModuleSettings.instance.reg(MATERIALS_FIXED, {
            name: 'Materials Fixed Ran?',
            scope: 'world',
            type: Boolean,
            default: false,
            config: false,
            restricted: true,
        });

        if (!ModuleSettings.instance.get(MATERIALS_FIXED)) {
            await fixMaterials();
        }
    });

    const commands = [new FixMaterials()];
    Hooks.on('chatMessage', (app, content) => {
        content = content.toLocaleLowerCase();

        for (let command of commands) {
            if (!command.shouldRun(content)) {
                continue;
            }

            if (command.execute(content)) {
                return false;
            }
        }
    });

    Hooks.on('ready', () => {
        game['PF2EToolbox'] = {
            secretSkillRoll: secretSkillRoll,
            distributeHeroPoints: distributeHeroPoints,
            groupSave: groupSave,
        };
        registerGroupSaveHooks();
    });
};
//   /pf2e-toolbox fix-materials
