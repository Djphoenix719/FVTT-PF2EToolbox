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

    private modifier = 0;
    private keyboardManager = new KeyboardManager();

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

    private getTotalModifier(): number {
        let modifier = 0;

        // shift
        if (this.keyboardManager.isDown(16)) {
            modifier += 5;
        }
        // ctrl
        if (this.keyboardManager.isDown(17)) {
            modifier += 5;
        }

        return modifier;
    }

    getData(options?: any): any {
        const data = super.getData(options);

        data.data = {
            levels: duplicate(ROLL_APP_DATA),
        };

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
            const rollName = target.data('rollname') as string;
            const token = canvas.tokens.controlled[0];

            let formula = target.data('formula') as string | number | undefined;

            if (formula) {
                formula = formula.toString();
                const modifier = this.getTotalModifier();
                console.warn(modifier);
                if (modifier > 0) {
                    formula = formula + modifier;
                }

                new Roll(formula.toString()).roll().toMessage(
                    {
                        speaker: ChatMessage.getSpeaker({ token }),
                        flavor: rollName,
                    },
                    {
                        rollMode: GetRollMode(),
                    },
                );
            }
        });
    }

    close(): Promise<any> {
        Hooks.off('controlToken', this.onControlToken.bind(this));
        document.removeEventListener('keydown', this.onKeyDown.bind(this));

        return super.close();
    }
}
