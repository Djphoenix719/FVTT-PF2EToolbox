import { ROLL_APP_DATA } from './RollAppData';
import { MODULE_NAME } from '../Constants';

export default class RollApp extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'NPC Roller';
        options.template = `modules/${MODULE_NAME}/templates/roll-app/index.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'roll-app'];
        options.tabs = [
            {
                navSelector: `.roll-app-nav`,
                contentSelector: `.roll-app-body`,
                initial: `.roll-app-attacks`,
            },
        ];
        options.width = 800;
        options.height = 'auto';
        options.resizable = true;
        return options;
    }

    public constructor(options?: ApplicationOptions) {
        super(options);

        Hooks.on('controlToken', this.onControlToken.bind(this));
    }

    getData(options?: any): any {
        const data = super.getData(options);

        data.data = {
            levels: duplicate(ROLL_APP_DATA),
        };

        data.icons = {};
        data.icons.terrible = '--';
        data.icons.low = '-';
        data.icons.moderate = '+';
        data.icons.high = '++';
        data.icons.extreme = '+++';

        for (const selected of canvas.tokens.controlled) {
            const placeable = selected as PlaceableObject;
            // @ts-ignore
            const actor = placeable.actor;

            const level = actor.data.data.details.level.value as number;
            data.data.levels[level].selected = true;
        }
        return data;
    }

    protected onControlToken() {
        setTimeout(this.render.bind(this), 0);
    }

    protected activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.find('a.rollable').on('click', (event) => {
            const target = $(event.target);
            const formula = target.data('formula') as string | undefined;

            if (formula) {
                new Roll(formula).roll().toMessage();
            }
        });
    }

    close(): Promise<any> {
        Hooks.off('controlToken', this.onControlToken.bind(this));

        return super.close();
    }
}
