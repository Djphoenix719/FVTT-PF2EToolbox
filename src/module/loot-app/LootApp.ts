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

const getTables = async () => {
    const pack = game.packs.get('pf2e.rollable-tables') as Compendium;
    const tables = (await pack.getContent()) as RollTable[];
    return { pack, tables };
};
const getEquipment = async () => {
    const pack = game.packs.get('pf2e.equipment-srd') as Compendium;
    const items = (await pack.getContent()) as Item[];
    return { pack, items };
};
const getItemFromCollection = async (collectionId: string, itemId: string) => {
    const pack = game.packs.get(collectionId) as Compendium;
    const entity = await pack.getEntity(itemId);
    console.warn(entity);
    return entity;
};

// THE FOLLOWING CODE IS FROM THE PF2E SYSTEM
type ItemPlaceholder = any;

interface Coins {
    pp: number;
    gp: number;
    sp: number;
    cp: number;
}

function toCoins(denomination: string, value: number): Coins {
    return {
        pp: denomination === 'pp' ? value : 0,
        gp: denomination === 'gp' ? value : 0,
        sp: denomination === 'sp' ? value : 0,
        cp: denomination === 'cp' ? value : 0,
    };
}

function noCoins(): Coins {
    return {
        pp: 0,
        gp: 0,
        sp: 0,
        cp: 0,
    };
}

function combineCoins(first: Coins, second: Coins): Coins {
    return {
        pp: first.pp + second.pp,
        gp: first.gp + second.gp,
        sp: first.sp + second.sp,
        cp: first.cp + second.cp,
    };
}

export function calculateWealth(items: ItemPlaceholder[]): Coins {
    return items
        .filter((item) => item.type === 'treasure' && item?.data?.denomination?.value !== undefined && item?.data?.denomination?.value !== null)
        .map((item) => {
            const value = (item.data?.value?.value ?? 1) * (item.data?.quantity?.value ?? 1);
            return toCoins(item.data.denomination.value, value);
        })
        .reduce(combineCoins, noCoins());
}
// END PF2E CODE

export default function extendLootSheet() {
    type ActorSheetConstructor = new (...args: any[]) => ActorSheet;
    const extendMe: ActorSheetConstructor = CONFIG.Actor.sheetClasses['loot']['pf2e.ActorSheetPF2eLoot'].cls;
    return class LootApp extends extendMe {
        static get defaultOptions() {
            // @ts-ignore
            const options = super.defaultOptions;
            options.title = 'Loot Helper';
            options.template = `modules/${MODULE_NAME}/templates/loot-app/LootApp.html`;
            options.classes = options.classes ?? [];
            options.classes = [...options.classes, 'pf2e-toolbox', 'loot-app'];

            options.tabs = options.tabs ?? [];
            options.tabs = [...options.tabs, { navSelector: '.generator-navigation', contentSelector: '.generator-content', initial: 'quick-treasure' }];
            return options;
        }

        get template() {
            const editableSheetPath = `modules/${MODULE_NAME}/templates/loot-app/LootApp.html`;
            const nonEditableSheetPath = 'systems/pf2e/templates/actors/loot-sheet-no-edit.html';

            const isEditable = this.actor.getFlag('pf2e', 'editLoot.value');

            if (isEditable && game.user.isGM) return editableSheetPath;

            return nonEditableSheetPath;
        }

        // @ts-ignore
        getData() {
            const actor = this.actor as Actor;
            return new Promise<any>(async (resolve) => {
                const renderData = await super.getData();

                const { pack, tables } = await getTables();

                let treasureTables = tables.filter((table) => {
                    if (table.data.name.endsWith('Art Object')) return true;
                    if (table.data.name.endsWith('Semiprecious Stones')) return true;
                    if (table.data.name.endsWith('Precious Stones')) return true;
                    return false;
                });

                treasureTables.sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });

                renderData['treasureTables'] = treasureTables;

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

                const tables = await getTables();
                const table = (await tables.pack.getEntity(tableId)) as RollTable;

                let rolls = await table.drawMany(drawCount);
                const promises = rolls.results.map((r) => {
                    return getItemFromCollection(r.collection, r.resultId);
                });

                let entities: (Entity | null)[] = await Promise.all(promises);

                let filtered = entities.filter((i) => i !== null && i !== undefined) as Entity[];

                if (filtered.length !== drawCount) {
                    ui.notifications.warn('Found one or more items in the rollable table that do not exist the compendium, skipping these.');
                }

                let results = filtered.map((i) => i.data);

                results = results.map((i) => {
                    const roll = new Roll('1d4').roll();
                    i.data.value.value = roll.total * i.data.value.value;
                    return i;
                });

                await actor.createEmbeddedEntity('OwnedItem', results);
            });

            html.find('button.clear-inventory').on('click', async (event) => {
                await actor.update({
                    items: [],
                });
            });
        }
    };
}
