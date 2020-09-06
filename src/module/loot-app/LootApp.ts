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
import { GetItemFromCollection, GetMagicItemTables, GetTreasureTables } from './LootAppUtil';
import { CREATE_KEY_NONE, CREATE_MODES, CreateMode, IGradeStats, ITEM_GRADES, ITEM_MATERIALS, ITEM_RUNES } from './LootAppData';

type IMaterials = typeof ITEM_MATERIALS;
type IMaterial = IMaterials[keyof typeof ITEM_MATERIALS];

const CREATE_MODE = 'create-mode';

const KEY_ITE = 'create-baseItem';
const KEY_MAT = 'create-material';
const KEY_GRD = 'create-grade';
const KEY_POT = 'create-potency';
const KEY_FUN = 'create-fundamental';
const KEY_RU1 = 'create-property1';
const KEY_RU2 = 'create-property2';
const KEY_RU3 = 'create-property3';

interface SelectOption {
    id: string;
    label: string;
}

const itemToOption = (item: Item): SelectOption => {
    return {
        id: item.id,
        label: item.name,
    };
};
const materialToOption = (mat: IMaterial): SelectOption => {
    return {
        id: mat.id,
        label: mat.label,
    };
};

const materialHasGrade = (materialKey: string, gradeKey: string): boolean => {
    return ITEM_MATERIALS[materialKey]?.hasOwnProperty(gradeKey);
};

const getItemPrice = (stringValue: string): number => {
    const [value, denomination] = stringValue.split(' ');
    if (denomination === 'pp') return parseInt(value) * 10;
    if (denomination === 'gp') return parseInt(value);
    if (denomination === 'sp') return parseInt(value) / 10;
    if (denomination === 'cp') return parseInt(value) / 100;
    return parseInt(value);
};
const getMaterialPrice = (bulkString: string, pricePerBulk: number): number => {
    let bulkNumber = 0;

    if (bulkString === '-') bulkNumber = 0;
    else if (bulkString === 'L') bulkNumber = 0.1;
    else bulkNumber = parseInt(bulkString);

    return bulkNumber * pricePerBulk;
};

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
            options.tabs = [...options.tabs, { navSelector: '.loot-app-nav', contentSelector: '.loot-app-content', initial: 'create' }];
            return options;
        }

        actor: Actor;
        cacheContent: Item[] | undefined;

        get template() {
            const editableSheetPath = `modules/${MODULE_NAME}/templates/loot-app/LootApp.html`;
            const nonEditableSheetPath = 'systems/pf2e/templates/actors/loot-sheet-no-edit.html';

            const isEditable = this.actor.getFlag('pf2e', 'editLoot.value');

            if (isEditable && game.user.isGM) {
                return editableSheetPath;
            }

            return nonEditableSheetPath;
        }

        get createMode(): CreateMode {
            return this.actor.getFlag(MODULE_NAME, CREATE_MODE) ?? CreateMode.Weapon;
        }

        get selIteKey(): string {
            return this.actor.getFlag(MODULE_NAME, KEY_ITE) ?? CREATE_KEY_NONE;
        }
        get selMatKey(): string {
            return this.actor.getFlag(MODULE_NAME, KEY_MAT) ?? CREATE_KEY_NONE;
        }
        get selGrdKey(): string {
            return this.actor.getFlag(MODULE_NAME, KEY_GRD) ?? CREATE_KEY_NONE;
        }
        get selPotKey(): string {
            return this.actor.getFlag(MODULE_NAME, KEY_POT) ?? CREATE_KEY_NONE;
        }
        get selFunKey(): string {
            return this.actor.getFlag(MODULE_NAME, KEY_FUN) ?? CREATE_KEY_NONE;
        }

        async getSelectedItem(): Promise<Item | undefined> {
            const equipment = await this.getEquipmentContent();

            const id = this.selIteKey;
            return equipment.find((i) => i.id === id);
        }

        calculateCreatePrice(): number {
            let matKey = this.selMatKey;
            let grdKey = this.selGrdKey;

            if (!matKey || !grdKey) {
                return 0;
            }

            if (!materialHasGrade(matKey, grdKey)) {
                grdKey = ITEM_MATERIALS[matKey].defaultGrade;
            }

            let mat = duplicate(ITEM_MATERIALS[matKey]);
            let grd = duplicate(ITEM_MATERIALS[matKey][grdKey]) as IGradeStats;

            return 0;
        }

        calculateCreateLevel(): number {
            return 0;
        }

        async getEquipmentContent(): Promise<Item[]> {
            // cache content to avoid 2-3s delay on .getContent
            if (this.cacheContent) {
                return this.cacheContent;
            }

            const equipment = game.packs.get('pf2e.equipment-srd') as Compendium;
            this.cacheContent = (await equipment.getContent()) as Item[];
            return this.cacheContent;
        }

        async collectBaseArmors(): Promise<SelectOption[]> {
            const equipmentContent = await this.getEquipmentContent();
            return equipmentContent
                .filter((i) => {
                    if (i.data.type !== 'armor') return false;
                    if (i.data.data.level.value > 0) return false;
                    if ([''].includes(i.data.data.group.value)) return false;
                    return true;
                })
                .map(itemToOption);
        }

        async collectBaseWeapons(): Promise<SelectOption[]> {
            const equipmentContent = await this.getEquipmentContent();
            return equipmentContent
                .filter((i) => {
                    if (i.data.type !== 'weapon') return false;
                    if (i.data.name === 'Aldori Dueling Sword') return true;
                    if (i.data.data.level.value > 0) return false;
                    if (['bomb'].includes(i.data.data.group.value)) return false;
                    return true;
                })
                .map(itemToOption);
        }

        // @ts-ignore
        getData() {
            return new Promise<any>(async (resolve) => {
                const renderData = await super.getData();

                const getFlag = (key: string): any => {
                    return this.actor.getFlag(MODULE_NAME, key);
                };
                const setFlag = async (key: string, value: string): Promise<Actor> => {
                    return await this.actor.setFlag(MODULE_NAME, key, value);
                };

                renderData['treasureTables'] = await GetTreasureTables();
                renderData['magicItemTables'] = await GetMagicItemTables('Permanent Items');
                renderData['consumablesTables'] = await GetMagicItemTables('Consumables Items');

                renderData['flags'] = this.actor.data.flags;

                renderData['createModes'] = CREATE_MODES;
                renderData['create'] = {};

                if (this.selMatKey && !materialHasGrade(this.selMatKey, this.selGrdKey)) {
                    await setFlag(KEY_GRD, ITEM_MATERIALS[this.selMatKey].defaultGrade);
                }

                // Item materials
                renderData['create']['material'] = ITEM_MATERIALS[this.selMatKey];
                renderData['create']['materialOptions'] = Object.keys(ITEM_MATERIALS).map((key) => {
                    return {
                        id: ITEM_MATERIALS[key].id,
                        label: ITEM_MATERIALS[key].label,
                    };
                });

                // Material hardness, hp, bt
                let material = ITEM_MATERIALS[this.selMatKey];
                let materialGradeStats = material[this.selGrdKey] as IGradeStats | undefined;
                if (materialGradeStats === undefined) {
                    materialGradeStats = material[material.defaultGrade] as IGradeStats;
                }

                let thicknessKey = this.createMode === CreateMode.Weapon ? 'thinItems' : 'items';
                if (thicknessKey === 'thinItems' && materialGradeStats[thicknessKey] === undefined) {
                    thicknessKey = 'items';
                }

                renderData['create']['materialHardness'] = materialGradeStats[thicknessKey].hardness;
                renderData['create']['materialHp'] = materialGradeStats[thicknessKey].hp;
                renderData['create']['materialBt'] = materialGradeStats[thicknessKey].bt;
                renderData['create']['materialPrice'] = materialGradeStats.pricePerBulk;

                // Material grades
                renderData['create']['grade'] = ITEM_GRADES[this.selGrdKey];
                renderData['create']['gradeOptions'] = Object.keys(ITEM_GRADES)
                    .filter((grade) => materialHasGrade(this.selMatKey, grade))
                    .map((key) => {
                        return {
                            id: ITEM_GRADES[key].id,
                            label: ITEM_GRADES[key].label,
                        };
                    });

                // Item runes
                renderData['create']['runes'] = ITEM_RUNES;

                // Base item
                const baseItem = await this.getSelectedItem();
                renderData['create']['baseItem'] = baseItem;
                if (baseItem) {
                    renderData['create']['baseItemLevel'] = baseItem.data.data.level.value;
                    renderData['create']['baseItemPrice'] = getItemPrice(baseItem.data.data.price.value);
                }

                switch (this.createMode) {
                    case CreateMode.Weapon:
                        renderData['create']['baseItemOptions'] = await this.collectBaseWeapons();
                        break;
                    case CreateMode.Armor:
                        renderData['create']['baseItemOptions'] = await this.collectBaseArmors();
                        break;
                }

                const getRuneData = (name: string, key: string) => {
                    const selKey = this.actor.getFlag(MODULE_NAME, key) as string | undefined;
                    if (!selKey) return;

                    const rune = ITEM_RUNES[this.createMode].property[selKey];

                    renderData['create'][name] = rune;
                    renderData['create'][`${name}Level`] = rune.level;
                    renderData['create'][`${name}Price`] = rune.price;
                };

                // Item potency
                const potency = ITEM_RUNES[this.createMode].potency[this.selPotKey];
                renderData['create']['potency'] = potency;
                renderData['create']['potencyOptions'] = ITEM_RUNES[this.createMode].potency;
                renderData['create']['potencyLevel'] = potency.level;
                renderData['create']['potencyPrice'] = potency.price;

                // Item property
                renderData['create']['propertyOptions'] = ITEM_RUNES[this.createMode].property;
                getRuneData('property1', KEY_RU1);
                getRuneData('property2', KEY_RU2);
                getRuneData('property3', KEY_RU3);

                renderData['create']['itemPrice'] = this.calculateCreatePrice();
                renderData['create']['itemLevel'] = this.calculateCreateLevel();

                renderData['create']['itemPrice'] += renderData['create']['potencyPrice'];
                renderData['create']['itemLevel'] = Math.max(renderData['create']['itemLevel'], renderData['create'][`potencyLevel`]);
                renderData['create']['itemPrice'] += renderData['create']['baseItemPrice'];
                renderData['create']['itemPrice'] += getMaterialPrice(baseItem?.data.data.weight.value, renderData['create']['materialPrice']);

                for (let i = 1; i < 4; i++) {
                    renderData['create']['itemPrice'] += renderData['create'][`property${i}Price`];
                    renderData['create']['itemLevel'] = Math.max(renderData['create']['itemLevel'], renderData['create'][`property${i}Level`]);
                }

                console.warn(renderData);

                resolve(renderData);
            });
        }

        activateListeners(html: JQuery) {
            super.activateListeners(html);

            html.find('select').on('input', (event) => {
                this._onSubmit(event);
            });

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

            html.find('button.clear-inventory').on('click', async (event) => {
                await actor.update({
                    items: [],
                });
            });
        }
    };
}
