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

import { MODULE_NAME, PF2E_LOOT_SHEET_NAME } from '../Constants';
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
    let bulkNumber;
    if (bulkString === '-') bulkNumber = 0;
    else if (bulkString === 'L') bulkNumber = 0.1;
    else bulkNumber = parseInt(bulkString);

    return bulkNumber * pricePerBulk;
};

export default function extendLootSheet() {
    type ActorSheetConstructor = new (...args: any[]) => ActorSheet;
    const extendMe: ActorSheetConstructor = CONFIG.Actor.sheetClasses['loot'][`pf2e.${PF2E_LOOT_SHEET_NAME}`].cls;
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
            const nonEditableSheetPath = 'systems/pf2e/templates/actors/loot/sheet.html';

            const isEditable = this.actor.getFlag('pf2e', 'editLoot.value');

            if (isEditable || game.user.isGM) {
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
                    // 3 exceptions to the 0 level rule
                    if (['Full Plate', 'Half Plate', 'Splint Mail'].includes(i.data.name)) return true;
                    if (i.data.data.level.value > 0) return false;
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

                renderData['treasureTables'] = await GetTreasureTables();
                // Quick Mystification breaks when these are enabled, investigate.
                renderData['magicItemTables'] = await GetMagicItemTables('Permanent Items');
                renderData['consumablesTables'] = await GetMagicItemTables('Consumables Items');

                renderData['flags'] = this.actor.data.flags;

                renderData['create'] = {
                    mode: this.createMode,
                    modes: CREATE_MODES,
                };

                if (this.selMatKey && !materialHasGrade(this.selMatKey, this.selGrdKey)) {
                    await this.actor.setFlag(MODULE_NAME, KEY_GRD, ITEM_MATERIALS[this.selMatKey].defaultGrade);
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
                let material = ITEM_MATERIALS[this.selMatKey] as IMaterial | undefined;
                if (material === undefined) {
                    material = ITEM_MATERIALS['metal'];
                }

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
                    renderData['create']['baseItemLevel'] = parseInt(baseItem.data.data.level.value);
                    renderData['create']['baseItemPrice'] = getItemPrice(baseItem.data.data.price.value);
                }

                let items: SelectOption[];
                switch (this.createMode) {
                    case CreateMode.Weapon:
                        items = await this.collectBaseWeapons();
                        renderData['create']['baseItemOptions'] = items;
                        break;
                    case CreateMode.Armor:
                        items = await this.collectBaseArmors();
                        renderData['create']['baseItemOptions'] = items;
                        break;
                }

                if (!items.find((i) => i.id === this.selIteKey)) {
                    await this.actor.setFlag(MODULE_NAME, KEY_ITE, items[0].id);
                }

                const getRuneData = async (name: string, key: string) => {
                    const selKey = this.actor.getFlag(MODULE_NAME, `${key}`) as string | undefined;
                    if (!selKey) return;

                    let rune = ITEM_RUNES[this.createMode].property[selKey];
                    if (rune === undefined) {
                        await this.actor.setFlag(MODULE_NAME, key, CREATE_KEY_NONE);
                        return;
                    }

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

                // Fundamental runes
                let fundamental = ITEM_RUNES[this.createMode].fundamental[this.selFunKey];
                if (fundamental === undefined) {
                    await this.actor.setFlag(MODULE_NAME, KEY_FUN, CREATE_KEY_NONE);
                    fundamental = ITEM_RUNES[this.createMode].fundamental[this.selFunKey];
                }

                renderData['create']['fundamental'] = fundamental;
                renderData['create']['fundamentalOptions'] = ITEM_RUNES[this.createMode].fundamental;
                renderData['create']['fundamentalLevel'] = fundamental.level;
                renderData['create']['fundamentalPrice'] = fundamental.price;

                if (potency.nId === 0 && this.actor.getFlag(MODULE_NAME, KEY_FUN) !== CREATE_KEY_NONE) {
                    await this.actor.setFlag(MODULE_NAME, KEY_FUN, CREATE_KEY_NONE);
                }

                // Item property
                for (let i = 3; i > 0; i--) {
                    const key = `create-property${i}`;
                    if (potency.nId < i && this.actor.getFlag(MODULE_NAME, key) !== CREATE_KEY_NONE) {
                        await this.actor.setFlag(MODULE_NAME, key, CREATE_KEY_NONE);
                    }
                }

                renderData['create']['propertyOptions'] = ITEM_RUNES[this.createMode].property;
                await getRuneData('property1', KEY_RU1);
                await getRuneData('property2', KEY_RU2);
                await getRuneData('property3', KEY_RU3);

                renderData['create']['itemPrice'] = renderData['create']['baseItemPrice'];
                renderData['create']['itemLevel'] = renderData['create']['baseItemLevel'];

                renderData['create']['itemPrice'] += getMaterialPrice(baseItem?.data.data.weight.value, materialGradeStats.pricePerBulk);

                renderData['create']['itemPrice'] += renderData['create']['potencyPrice'];
                renderData['create']['itemLevel'] = Math.max(renderData['create']['itemLevel'], renderData['create'][`potencyLevel`]);

                renderData['create']['itemPrice'] += renderData['create']['fundamentalPrice'];
                renderData['create']['itemLevel'] = Math.max(renderData['create']['itemLevel'], renderData['create'][`fundamentalLevel`]);

                for (let i = 1; i < 4; i++) {
                    const price = `property${i}Price`;
                    const level = `property${i}Level`;

                    if (renderData['create'][price]) {
                        renderData['create']['itemPrice'] += renderData['create'][price];
                    }
                    if (renderData['create'][level]) {
                        renderData['create']['itemLevel'] = Math.max(renderData['create']['itemLevel'], renderData['create'][level]);
                    }
                }

                renderData['create']['itemRarity'] = baseItem?.data.data.traits.rarity.value.capitalize();
                if (renderData['create']['itemLevel'] === 25) {
                    renderData['create']['itemRarity'] = 'Unique';
                }

                resolve(renderData);
            });
        }

        async createCustomItem(event: JQuery.ClickEvent): Promise<void> {
            const getFlag = (key: string): any => {
                return this.actor.getFlag(MODULE_NAME, key);
            };
            const getSelected = (key: string): string => {
                return getFlag(key) ?? CREATE_KEY_NONE;
            };

            const baseItem = (await this.getSelectedItem()) as Item;
            const newItemData = duplicate(baseItem?.data) as ItemData;

            let itemPrice = getItemPrice(baseItem.data.data.price.value);
            let itemLevel = parseInt(baseItem.data.data.level.value);

            const material = ITEM_MATERIALS[this.selMatKey];
            const gradeStats = material[this.selGrdKey] as IGradeStats;
            let thicknessKey = this.createMode === CreateMode.Weapon ? 'thinItems' : 'items';
            if (thicknessKey === 'thinItems' && gradeStats[thicknessKey] === undefined) {
                thicknessKey = 'items';
            }

            newItemData.data.hardness.value = gradeStats[thicknessKey].hardness;
            newItemData.data.brokenThreshold.value = gradeStats[thicknessKey].bt;
            newItemData.data.hp.value = gradeStats[thicknessKey].hp;
            newItemData.data.maxHp.value = gradeStats[thicknessKey].hp;

            newItemData.data.preciousMaterial.value = material.id;
            newItemData.data.preciousMaterialGrade.value = this.selGrdKey;

            itemPrice += getMaterialPrice(baseItem.data.data.weight.value, gradeStats.pricePerBulk);

            let potencyRune = ITEM_RUNES[this.createMode].potency[this.selPotKey];
            newItemData.data.potencyRune.value = this.selPotKey;

            itemPrice += potencyRune.price;
            itemLevel = Math.max(itemLevel, potencyRune.level);

            switch (this.createMode) {
                case CreateMode.Weapon:
                    newItemData.data.strikingRune.value = this.selFunKey;
                    break;
                case CreateMode.Armor:
                    newItemData.data.resiliencyRune.value = this.selFunKey;
                    break;
            }

            let propertyRune1 = ITEM_RUNES[this.createMode].property[getSelected(KEY_RU1)];
            let propertyRune2 = ITEM_RUNES[this.createMode].property[getSelected(KEY_RU2)];
            let propertyRune3 = ITEM_RUNES[this.createMode].property[getSelected(KEY_RU3)];
            let fundamentalRune = ITEM_RUNES[this.createMode].fundamental[getSelected(KEY_FUN)];

            newItemData.data.propertyRune1.value = propertyRune1.id;
            newItemData.data.propertyRune2.value = propertyRune2.id;
            newItemData.data.propertyRune3.value = propertyRune3.id;

            itemPrice += propertyRune1.price;
            itemPrice += propertyRune2.price;
            itemPrice += propertyRune3.price;
            itemPrice += fundamentalRune.price;

            itemLevel = Math.max(itemLevel, propertyRune1.level);
            itemLevel = Math.max(itemLevel, propertyRune1.level);
            itemLevel = Math.max(itemLevel, propertyRune1.level);

            let itemName = baseItem.name;

            for (let i = 3; i > 0; i--) {
                const key = `create-property${i}`;
                const keyRu = this.actor.getFlag(MODULE_NAME, key);
                if (potencyRune.nId >= i && keyRu !== CREATE_KEY_NONE) {
                    const rune = ITEM_RUNES[this.createMode].property[keyRu];
                    itemName = `${rune.label} ${itemName}`;
                }
            }

            if (fundamentalRune.id !== CREATE_KEY_NONE) {
                itemName = `${fundamentalRune.label} ${itemName}`;
            }

            if (potencyRune.nId > 0) {
                itemName = `+${potencyRune.nId} ${itemName}`;
            }

            newItemData.data.level.value = itemLevel;
            newItemData.data.price.value = `${itemPrice} gp`;

            if (itemLevel === 25) {
                newItemData.data.traits.rarity.value = 'unique';
                newItemData.data.price.value = `—`;
            }

            newItemData.name = itemName;

            if (event.altKey && Settings.get(Settings.FEATURES.QUICK_MYSTIFY)) {
                newItemData.data.identification = {
                    status: 'unidentified',
                    identified: {
                        name: newItemData.name,
                    },
                };

                let newName: string = newItemData.type === 'weapon' ? newItemData.data.group.value : newItemData.data.armorType.value;
                newName = newName.capitalize();

                newItemData.name = `Unidentified ${newName}`;
            }

            await this.actor.createOwnedItem(newItemData);
        }

        activateListeners(html: JQuery) {
            super.activateListeners(html);

            html.find('select').on('input', (event) => {
                this._onSubmit(event);
            });

            html.find('#create').on('click', (event) => {
                this.createCustomItem(event);
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
                    if (!i.data.value?.value) {
                        return i;
                    }

                    const roll = new Roll('1d4').roll();
                    i.data.value.value = roll.total * i.data.value.value;
                    return i;
                });

                if (Settings.get(Settings.FEATURES.QUICK_MYSTIFY) && event.altKey) {
                    for (const item of results) {
                        item.data.identification = {
                            status: 'unidentified',
                            identified: {
                                name: item.name,
                            },
                        };
                        let newName = item.type.capitalize();
                        item.name = `Unidentified ${newName}`;
                    }
                }

                await actor.createEmbeddedEntity('OwnedItem', results);
            });
            html.find('button.roll-magic-item').on('click', async (event) => {
                event.preventDefault();

                const button = $(event.currentTarget) as JQuery<HTMLButtonElement>;
                const tableId = button.data('entity-id') as string;
                const drawCount = Number(button.data('count'));

                const table = (await GetItemFromCollection('pf2e.rollable-tables', tableId)) as RollTable;

                let rolls = await table.drawMany(drawCount);
                const promises = rolls.results.map((r) => {
                    if (!r.hasOwnProperty('collection')) {
                        return Promise.resolve(null);
                    }
                    return GetItemFromCollection(r.collection, r.resultId);
                });

                let entities: (Entity | null)[] = await Promise.all(promises);

                let filtered = entities.filter((i) => i !== null && i !== undefined) as Entity[];

                if (filtered.length !== drawCount) {
                    ui.notifications.warn(
                        'PF2EToolbox drew a custom weapon, custom armor, or typed potion, but these are not supported. One or more rolls has been skipped.',
                    );
                }

                let results = filtered.map((i) => i.data);

                if (Settings.get(Settings.FEATURES.QUICK_MYSTIFY) && event.altKey) {
                    for (const item of results) {
                        item.data.identification = {
                            status: 'unidentified',
                            identified: {
                                name: item.name,
                            },
                        };
                        let newName = item.type.capitalize();
                        item.name = `Unidentified ${newName}`;
                    }
                }

                await actor.createEmbeddedEntity('OwnedItem', results);

                await new Promise((resolve) => setTimeout(resolve, 1000));
            });

            html.find('button.clear-inventory').on('click', async (event) => {
                await actor.update({
                    items: [],
                });
            });
        }
    };
}
