import { MODULE_NAME } from '../Constants';
import { ROLL_APP_DATA } from '../roll-app/RollAppData';

enum ValueCategory {
    extreme = 'extreme',
    high = 'high',
    moderate = 'moderate',
    low = 'low',
    terrible = 'terrible',
    abysmal = 'abysmal',
}

class CreatureValueEntry {
    descriptor: string;
    actorField: string;
    availableValues: ValueCategory[];
    defaultValue: ValueCategory;

    constructor(descriptor: string, actorField: string, availableValues: ValueCategory[], defaultValue: ValueCategory) {
        this.descriptor = descriptor;
        this.actorField = actorField;
        this.availableValues = availableValues;
        this.defaultValue = defaultValue;
    }
}

export default class CreatureBuilder extends FormApplication {
    valueEntries: CreatureValueEntry[];

    constructor(object: any, options: FormApplicationOptions) {
        super(object, options);

        this.valueEntries = [
            new CreatureValueEntry('perception', 'data.attributes.perception.value',
                [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
                ValueCategory.extreme),
        ];
    }

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

        for (const valueEntry of this.valueEntries) {
            formData[valueEntry.actorField] = ROLL_APP_DATA[valueEntry.descriptor][level + 1][formData[valueEntry.descriptor]];
        }

        return this.object.update(formData);
    }
}