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

export const setupFlattenProficiency = () => Hooks.on('getActorDirectoryEntryContext', onFlattenProficiencyContextHook);

function onFlattenProficiencyContextHook(html: JQuery, buttons: any[]) {
    const modifierName = 'Proficiency Without Level';
    const hasModifier = (actor: Actor) => {
        const data = actor.data.data;
        if (data['customModifiers'] && data['customModifiers'].all) {
            const all = data['customModifiers'].all;
            for (const modifier of all) {
                if (modifier.name === modifierName) {
                    return true;
                }
            }
        }
        return false;
    };

    buttons.unshift({
        name: 'Flatten NPC',
        icon: '<i class="fas fa-level-down-alt"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc' && !hasModifier(actor);
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            const level = parseInt(actor.data.data['details'].level.value);
            await (actor as any).addCustomModifier('all', modifierName, -level, 'untyped');
        },
    });

    buttons.unshift({
        name: 'Unflatten NPC',
        icon: '<i class="fas fa-level-up-alt"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc' && hasModifier(actor);
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            await (actor as any).removeCustomModifier('all', modifierName);
        },
    });
}
