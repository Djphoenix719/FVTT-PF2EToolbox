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

const CREATE_BASE_WEAPON = 'create-base-weapon';
const CREATE_BASE_ARMOR = 'create-base-armor';

const CREATE_MATERIAL = 'create-material';
const CREATE_GRADE = 'create-grade';
const CREATE_POTENCY = 'create-potency';
const CREATE_FUNDAMENTAL = 'create-fundamental';

interface ItemNameAndId {
    id: string;
    label: string;
}

const equipmentMap = (item: Item): ItemNameAndId => {
    return {
        id: item.id,
        label: item.name,
    };
};

const materialHasGrade = (materialKey: string, gradeKey: string): boolean => {
    return ITEM_MATERIALS[materialKey]?.hasOwnProperty(gradeKey);
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
            return this.actor.getFlag(MODULE_NAME, CREATE_MODE);
        }
        get selectedMaterialKey(): string {
            return this.actor.getFlag(MODULE_NAME, CREATE_MATERIAL) ?? CREATE_KEY_NONE;
        }
        get selectedGradeKey(): string {
            return this.actor.getFlag(MODULE_NAME, CREATE_GRADE) ?? CREATE_KEY_NONE;
        }

        // async getBaseItem(): Promise<Item | null> {
        //     const content = await this.getEquipmentContent();
        //     switch (this.createMode) {
        //         case CreateMode.Weapon:
        //             return content.find((i) => i.id === this.)
        //             break;
        //         case CreateMode.Armor:
        //             break;
        //     }
        // }

        calculateCreatePrice(): number {
            let matKey = this.selectedMaterialKey;
            let grdKey = this.selectedGradeKey;

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
            const equipment = game.packs.get('pf2e.equipment-srd') as Compendium;
            return (await equipment.getContent()) as Item[];
        }

        async collectBaseArmors(): Promise<ItemNameAndId[]> {
            const equipmentContent = await this.getEquipmentContent();
            return equipmentContent
                .filter((i) => {
                    if (i.data.type !== 'armor') return false;
                    if (i.data.data.level.value > 0) return false;
                    if ([''].includes(i.data.data.group.value)) return false;
                    return true;
                })
                .map(equipmentMap);
        }

        async collectBaseWeapons(): Promise<ItemNameAndId[]> {
            const equipmentContent = await this.getEquipmentContent();
            return equipmentContent
                .filter((i) => {
                    if (i.data.type !== 'weapon') return false;
                    if (i.data.name === 'Aldori Dueling Sword') return true;
                    if (i.data.data.level.value > 0) return false;
                    if (['bomb'].includes(i.data.data.group.value)) return false;
                    return true;
                })
                .map(equipmentMap);
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

                const selectedGrade = getFlag(CREATE_GRADE);
                const selectedMaterial = getFlag(CREATE_MATERIAL);
                const selectedPotency = getFlag(CREATE_POTENCY);

                if (selectedMaterial && !materialHasGrade(selectedMaterial, selectedGrade)) {
                    await setFlag(CREATE_GRADE, ITEM_MATERIALS[selectedMaterial].defaultGrade);
                }

                renderData['create']['materials'] = Object.keys(ITEM_MATERIALS).map((key) => {
                    return {
                        key,
                        id: ITEM_MATERIALS[key].id,
                        label: ITEM_MATERIALS[key].label,
                    };
                });
                renderData['create']['grades'] = Object.keys(ITEM_GRADES)
                    .map((key) => {
                        return {
                            key,
                            id: ITEM_GRADES[key].id,
                            label: ITEM_GRADES[key].label,
                        };
                    })
                    .filter((grade) => materialHasGrade(selectedMaterial, grade.key));
                renderData['create']['runes'] = ITEM_RUNES;

                renderData['price'] = this.calculateCreatePrice();
                renderData['level'] = this.calculateCreateLevel();

                renderData['create']['weapons'] = await this.collectBaseWeapons();
                renderData['create']['armors'] = await this.collectBaseArmors();

                resolve(renderData);
            });
        }

        activateListeners(html: JQuery) {
            super.activateListeners(html);

            html.find('select').on('input', (event) => {
                this._onSubmit(event);
            });

            html.find('#create-mode').on('input', async (event) => {
                await this.actor.update({
                    [`flags.pf2e-toolbox.${CREATE_BASE_WEAPON}`]: '',
                    [`flags.pf2e-toolbox.${CREATE_BASE_ARMOR}`]: '',
                });
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
