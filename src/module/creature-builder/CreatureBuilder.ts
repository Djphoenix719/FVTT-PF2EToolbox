import { MODULE_NAME } from '../Constants';
import { ROLL_APP_DATA } from '../roll-app/RollAppData';
import { CreatureValueCategory, CreatureValueEntry, DefaultCreatureValues } from './CreatureBuilderData';

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

    protected _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const level = formData['data.details.level.value'];

        const newFormData = {};
        newFormData['data.details.level.value'] = level;

        for (const category of this.valueCategories) {
            for (const value of category.associatedValues) {
                const buttonFieldName = value.name === undefined ? category.name : value.name;

                newFormData[value.actorField] = ROLL_APP_DATA[category.descriptor][level + 1][formData[buttonFieldName]];
            }
        }

        return this.object.update(newFormData);
    }
}