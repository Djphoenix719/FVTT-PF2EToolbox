import { MODULE_NAME } from '../Constants';
import { ROLL_APP_DATA } from '../roll-app/RollAppData';
import {
    CreatureValueCategory,
    CreatureValueEntry,
    DefaultCreatureValues,
    Roadmap,
    ROADMAPS,
    StatisticOptions,
} from './CreatureBuilderData';

export default class CreatureBuilder extends FormApplication {
    // Create copy of the default values
    valueCategories: CreatureValueCategory[] = JSON.parse(JSON.stringify(DefaultCreatureValues));
    selectedRoadmap: Roadmap = {
        name: 'Default',
        tooltip: 'None',
        defaultValues: new Map(),
    };

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'Creature Builder';
        options.template = `modules/${MODULE_NAME}/templates/creature-builder/index.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'creature-builder'];
        options.width = 800;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    getData(options?: any): any {
        const renderData = super.getData(options);

        const valueCategories = this.valueCategories;

        for (let i = 0; i < valueCategories.length; i++) {
            const category = valueCategories[i];
            for (let j = 0; j < category.associatedValues.length; j++) {
                const value = category.associatedValues[j];

                const name = CreatureBuilder.getName(category, value);

                if (this.selectedRoadmap.defaultValues.has(name)) {
                    valueCategories[i].associatedValues[j].defaultValue = this.selectedRoadmap.defaultValues.get(name) ?? StatisticOptions.moderate;
                } else {
                    valueCategories[i].associatedValues[j].defaultValue = DefaultCreatureValues[i].associatedValues[j].defaultValue;
                }
            }
        }

        renderData['roadMaps'] = ROADMAPS;
        renderData['valueCategories'] = valueCategories;

        return renderData;
    }

    private static getName(parentCategory: CreatureValueCategory, value: CreatureValueEntry) : string {
        return value.name !== undefined ? value.name : parentCategory.name;
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const level = formData['data.details.level.value'];

        const newFormData = {};
        newFormData['data.details.level.value'] = level;

        for (const category of this.valueCategories) {
            if (category.descriptor === 'strike') {
                await this.updateAttack(formData, category, level);
            } else if (category.descriptor === 'spellcasting') {
                await this.updateSpellcasting(formData, category, level);
            } else {
                for (const value of category.associatedValues) {
                    const buttonFieldName = CreatureBuilder.getButtonFieldName(value, category);
                    const valueToBeInsertedIntoNpc = CreatureBuilder.getValueToBeInsertedIntoNpc(category.descriptor, level, formData, buttonFieldName);

                    if (category.descriptor === 'skill') {
                        await this.updateSkill(formData, buttonFieldName, valueToBeInsertedIntoNpc);
                    } else if (category.descriptor === 'hitPoints') {
                        CreatureBuilder.updateHitPoints(valueToBeInsertedIntoNpc, value, newFormData);
                    } else {
                        newFormData[value.actorField] = valueToBeInsertedIntoNpc;
                    }
                }
            }
        }

        return this.object.update(newFormData);
    }

    private static updateHitPoints(valueToBeInsertedIntoNpc, value: CreatureValueEntry, newFormData: {}) {
        const hitPointsValue = valueToBeInsertedIntoNpc.maximum;
        const hitPointFieldsToUpdate = value.actorField.split(',');
        for (const field of hitPointFieldsToUpdate) {
            newFormData[field] = hitPointsValue;
        }
    }

    private static getButtonFieldName(value: CreatureValueEntry, category: CreatureValueCategory) : string {
        return value.name === undefined ? category.name : value.name;
    }

    private static getValueToBeInsertedIntoNpc(descriptor: string, level, formData: any, buttonFieldName: string) : number | string | any {
        return ROLL_APP_DATA[descriptor][level + 1][formData[buttonFieldName]];
    }

    private async updateSkill(formData: any, buttonFieldName: string, valueToBeInsertedIntoNpc) {
        if (formData[buttonFieldName] !== StatisticOptions.none) {
            const data = CreatureBuilder.createNewSkillData(buttonFieldName, valueToBeInsertedIntoNpc);

            await this.object.createOwnedItem(data);
        }
    }

    private static createNewSkillData(buttonFieldName: string, valueToBeInsertedIntoNpc) {
        const data: any = {
            name: buttonFieldName,
            type: 'lore',
            data: {
                mod: {
                    value: valueToBeInsertedIntoNpc,
                },
            },
        };
        return data;
    }

    private async updateAttack(formData: any, strikeInfo: CreatureValueCategory, level: number) {
        let strikeBonus: number = 0;
        let strikeDamage: string = "1d4";

        for (const part of strikeInfo.associatedValues) {
            const descriptor = part.descriptor ?? 'undefined';
            const name = CreatureBuilder.getButtonFieldName(part, strikeInfo);
            const value: any = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptor, level, formData, name);

            if (part.descriptor === 'strikeAttack' && typeof value === 'number') {
                strikeBonus = value;
            } else if (part.descriptor === 'strikeDamage' && typeof value === 'string') {
                strikeDamage = value;
            }
        }

        const data = CreatureBuilder.createNewStrikeData(strikeDamage, strikeBonus);

        await this.object.createOwnedItem(data);
    }

    private static createNewStrikeData(strikeDamage: string, strikeBonus: number) {
        const data: any = {
            name: 'New Melee',
            type: 'melee',
            data: {
                damageRolls: [
                    {
                        damage: strikeDamage,
                    },
                ],
                bonus: {
                    value: strikeBonus,
                },
            },
        };
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.apply-road-map').click((ev) => {
            const skillSelector = $(ev.currentTarget).parents('#road-map-selector').find('select');
            const roadMapIndex: number = skillSelector.prop('selectedIndex') as number;

            this.selectedRoadmap = ROADMAPS[roadMapIndex];

            this.render(true);
        });
    }

    private async updateSpellcasting(formData: any, spellcastingInfo: CreatureValueCategory, level: any) {
        const spellcastingActive = formData['spellcastingProficiency'] !== StatisticOptions.none;

        if (!spellcastingActive) {
            return;
        }

        let spellcastingTradition: string = 'arcane';
        let spellcastingType: string = 'innate';
        let spellDc: number = 10;
        let spellAttack: number = 0;

        const name = CreatureBuilder.getButtonFieldName(spellcastingInfo.associatedValues[0], spellcastingInfo);

        const descriptorAttack = 'spell';
        let value: any = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptorAttack, level, formData, name);
        if (typeof value === 'number') {
            spellAttack = value;
        }

        const descriptorDc = 'difficultyClass';
        value = CreatureBuilder.getValueToBeInsertedIntoNpc(descriptorDc, level, formData, name);
        if (typeof value === 'number') {
            spellDc = value;
        }

        const data = CreatureBuilder.createNewSpellcastingEntryData(spellcastingTradition, spellcastingType, spellDc, spellAttack);

        await this.object.createEmbeddedEntity('OwnedItem', data);
    }

    private static createNewSpellcastingEntryData(tradition: string, type: string, dc: number, attack: number) {
        const name = 'Creature Spellcasting';

        const spellcastingEntity = {
            spelldc: {
                value: attack,
                dc: dc,
            },
            tradition: {
                type: 'String',
                label: 'Magic Tradition',
                value: tradition,
            },
            prepared: {
                type: 'String',
                label: 'Spellcasting Type',
                value: type,
            },
            attack: {
                value: attack,
            },
            showUnpreparedSpells: { value: true },
        };

        return {
            name,
            type: 'spellcastingEntry',
            data: spellcastingEntity,
        };
    }
}