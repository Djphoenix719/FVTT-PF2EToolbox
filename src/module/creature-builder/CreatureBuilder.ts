import { MODULE_NAME } from '../Constants';
import { ROLL_APP_DATA } from '../roll-app/RollAppData';
import { CreatureValueCategory, CreatureValueEntry, DefaultCreatureValues, ValueCategory } from './CreatureBuilderData';

export default class CreatureBuilder extends FormApplication {
    valueCategories: CreatureValueCategory[] = DefaultCreatureValues;

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

        renderData['valueCategories'] = this.valueCategories;

        return renderData;
    }

    protected async _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const level = formData['data.details.level.value'];

        const newFormData = {};
        newFormData['data.details.level.value'] = level;

        for (const category of this.valueCategories) {
            if (category.descriptor === 'strike') {
                await this.updateAttack(formData, category, level);
            } else {
                for (const value of category.associatedValues) {
                    const buttonFieldName = CreatureBuilder.getButtonFieldName(value, category);
                    const valueToBeInsertedIntoNpc = CreatureBuilder.getValueToBeInsertedIntoNpc(category.descriptor, level, formData, buttonFieldName);

                    if (category.descriptor === 'skill') {
                        await this.updateSkill(formData, buttonFieldName, valueToBeInsertedIntoNpc);
                    } else {
                        newFormData[value.actorField] = valueToBeInsertedIntoNpc;
                    }
                }
            }
        }

        return this.object.update(newFormData);
    }

    private static getButtonFieldName(value: CreatureValueEntry, category: CreatureValueCategory) : string {
        return value.name === undefined ? category.name : value.name;
    }

    private static getValueToBeInsertedIntoNpc(descriptor: string, level, formData: any, buttonFieldName: string) : number | string {
        return ROLL_APP_DATA[descriptor][level + 1][formData[buttonFieldName]];
    }

    private async updateSkill(formData: any, buttonFieldName: string, valueToBeInsertedIntoNpc) {
        if (formData[buttonFieldName] !== ValueCategory.none) {
            const data = this.createNewSkillData(buttonFieldName, valueToBeInsertedIntoNpc);

            await this.object.createOwnedItem(data);
        }
    }

    private createNewSkillData(buttonFieldName: string, valueToBeInsertedIntoNpc) {
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

        const data = this.createNewStrikeData(strikeDamage, strikeBonus);

        await this.object.createOwnedItem(data);
    }

    private createNewStrikeData(strikeDamage: string, strikeBonus: number) {
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
}