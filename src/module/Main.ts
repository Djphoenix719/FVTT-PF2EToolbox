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

import Settings from './settings-app/Settings';
import { registerHandlebarsHelpers, registerHandlebarsTemplates } from './Handlebars';
import secretSkillRoll from './macros/secret-skill-roll';
import distributeXp from './macros/distribute-xp';
import { distributeHeroPoints } from './macros/distribute-hero-points';
import { groupSave, registerGroupSaveHooks } from './macros/group-saves';

Hooks.on('init', Settings.registerAllSettings);
Hooks.on('init', Settings.onInit);

Hooks.on('setup', registerHandlebarsTemplates);
Hooks.on('setup', registerHandlebarsHelpers);
Hooks.on('setup', Settings.onSetup);

Hooks.on('ready', Settings.onReady);

Hooks.on('ready', () => {
    game['PF2EToolbox'] = {
        secretSkillRoll: secretSkillRoll,
        distributeXp: distributeXp,
        distributeHeroPoints: distributeHeroPoints,
        groupSave: groupSave,
    };
    registerGroupSaveHooks();
});
