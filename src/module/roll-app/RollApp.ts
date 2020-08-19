import { ROLL_APP_DATA } from './RollAppData';
import { MODULE_NAME } from '../Constants';
import { GetRollMode } from '../Utilities';

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
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.repeat) {
            return;
        }
        this.render();
    }

    getData(options?: any): any {
        const data = super.getData(options);

        data.data = {
            levels: duplicate(ROLL_APP_DATA),
        };

        // @ts-ignore
        data.data['selected'] = canvas.tokens.controlled.map((t: PlaceableObject) => parseInt(t.actor.data.data.details.level.value));

        return data;
    }

    protected onControlToken() {
        setTimeout(this.render.bind(this), 0);
    }

    protected activateListeners(html: JQuery) {
        super.activateListeners(html);

        const handler = (event) => {
            const target = $(event.target);
            const rollName = target.data('rollname') as string;
            const token = canvas.tokens.controlled[0];
            let formula = target.data('formula') as string | number | undefined;

            if (formula) {
                formula = formula.toString();

                if (event.button === 2) {
                    formula = `{${formula}}*2`;
                }

                new Roll(formula).roll().toMessage(
                    {
                        speaker: ChatMessage.getSpeaker({ token }),
                        flavor: rollName,
                    },
                    {
                        rollMode: GetRollMode(),
                    },
                );
            }
        };

        html.find('a.rollable').on('click', handler);
        html.find('a.rollable').on('contextmenu', handler);
    }

    close(): Promise<any> {
        Hooks.off('controlToken', this.onControlToken.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));

        return super.close();
    }
}
