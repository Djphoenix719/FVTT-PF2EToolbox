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
import Settings from '../settings-app/Settings';
import { GetItemFromCollection, GetMagicItemTables, GetRollableTables, GetTreasureTables } from './LootAppUtil';

export default function extendLootSheet() {
    type ActorSheetConstructor = new (...args: any[]) => ActorSheet;
    const extendMe: ActorSheetConstructor = CONFIG.Actor.sheetClasses['loot']['pf2e.ActorSheetPF2eLoot'].cls;
    return class LootApp extends extendMe {
        static get defaultOptions() {
            // @ts-ignore
            const options = super.defaultOptions;
            options.classes = options.classes ?? [];
            options.classes = [...options.classes, 'pf2e-toolbox', 'loot-app'];

            options.tabs = options.tabs ?? [];
            options.tabs = [...options.tabs, { navSelector: '.generator-navigation', contentSelector: '.generator-content', initial: 'treasure' }];
            return options;
        }

        get template() {
            const editableSheetPath = `modules/${MODULE_NAME}/templates/loot-app/LootApp.html`;
            const nonEditableSheetPath = 'systems/pf2e/templates/actors/loot-sheet-no-edit.html';

            const isEditable = this.actor.getFlag('pf2e', 'editLoot.value');

            if (isEditable && game.user.isGM) {
                return editableSheetPath;
            }

            return nonEditableSheetPath;
        }

        // @ts-ignore
        getData() {
            return new Promise<any>(async (resolve) => {
                const renderData = await super.getData();

                renderData['treasureTables'] = await GetTreasureTables();
                renderData['magicItemTables'] = await GetMagicItemTables('Permanent Items');
                renderData['consumablesTables'] = await GetMagicItemTables('Consumables Items');

                resolve(renderData);
            });
        }

        activateListeners(html: JQuery) {
            super.activateListeners(html);

            const actor = this.actor as Actor;
            html.find('button.roll-single-table').on('click', async (event) => {
                event.preventDefault();

                const button = $(event.currentTarget) as JQuery<HTMLButtonElement>;
                const tableId = button.data('entity-id') as string;
                const drawCount = Number(button.data('count'));

                const table = (await GetItemFromCollection('pf2e.rollable-tables', tableId)) as RollTable;

                let rolls = await table.drawMany(drawCount);

                const promises = rolls.results.map((r) => {
                    return GetItemFromCollection(r.collection, r.resultId);
                });

                let entities: (Entity | null)[] = await Promise.all(promises);

                let filtered = entities.filter((i) => i !== null && i !== undefined) as Entity[];

                if (filtered.length !== drawCount) {
                    ui.notifications.warn('Found one or more items in the rollable table that do not exist in the compendium, skipping these.');
                }

                let results = filtered.map((i) => i.data);

                results = results.map((i) => {
                    const roll = new Roll('1d4').roll();
                    i.data.value.value = roll.total * i.data.value.value;
                    return i;
                });

                const existingItems = actor.items.map((i) => i.id) as string[];
                await actor.createEmbeddedEntity('OwnedItem', results);

                if (Settings.get(Settings.FEATURES.QUICK_MYSTIFY) && event.altKey) {
                    const newItems = actor.items.filter((i: Item) => !existingItems.includes(i.id)) as Item[];
                    for (const item of newItems) {
                        window['ForienIdentification'].mystify(`Actor.${actor.id}.OwnedItem.${item.id}`, { replace: true });
                    }
                }
            });

            html.find('button.roll-magic-item').on('click', async (event) => {
                event.preventDefault();

                const button = $(event.currentTarget) as JQuery<HTMLButtonElement>;
                const tableId = button.data('entity-id') as string;
                const drawCount = Number(button.data('count'));

                const table = (await GetItemFromCollection('pf2e.rollable-tables', tableId)) as RollTable;

                let rolls = await table.drawMany(drawCount);

                console.warn(rolls);

                const promises = rolls.results.map((r) => {
                    return GetItemFromCollection(r.collection, r.resultId);
                });

                let entities: (Entity | null)[] = await Promise.all(promises);

                let filtered = entities.filter((i) => i !== null && i !== undefined) as Entity[];

                if (filtered.length !== drawCount) {
                    ui.notifications.warn('Found one or more items in the rollable table that do not exist in the compendium, skipping these.');
                }

                let results = filtered.map((i) => i.data);

                const existingItems = actor.items.map((i) => i.id) as string[];
                await actor.createEmbeddedEntity('OwnedItem', results);

                if (Settings.get(Settings.FEATURES.QUICK_MYSTIFY) && event.altKey) {
                    const newItems = actor.items.filter((i: Item) => !existingItems.includes(i.id)) as Item[];
                    for (const item of newItems) {
                        window['ForienIdentification'].mystify(`Actor.${actor.id}.OwnedItem.${item.id}`, { replace: true });
                    }
                }
            });

            html.find('button.clear-inventory').on('click', async (event) => {
                await actor.update({
                    items: [],
                });
            });
        }
    };
}
