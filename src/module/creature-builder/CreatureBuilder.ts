import { MODULE_NAME } from '../Constants';
import { ROLL_APP_DATA } from '../roll-app/RollAppData';
import { CreatureValueEntry, DefaultCreatureValues } from './CreatureBuilderData';

export default class CreatureBuilder extends FormApplication {
    valueEntries: CreatureValueEntry[] = DefaultCreatureValues;

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

        renderData['valueEntries'] = this.valueEntries;

        return renderData;
    }

    protected _updateObject(event: Event | JQuery.Event, formData: any): Promise<any> {
        const level = formData['data.details.level.value'];

        const newFormData = {};
        newFormData['data.details.level.value'] = level;

        for (const valueEntry of this.valueEntries) {
            newFormData[valueEntry.actorField] = ROLL_APP_DATA[valueEntry.descriptor][level + 1][formData[valueEntry.name]];
        }

        return this.object.update(newFormData);
    }
}