/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
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

    public constructor(options?: Application.Options) {
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

        data['data'] = {
            levels: duplicate(ROLL_APP_DATA),
        };

        data['data']['selected'] = canvas.tokens?.controlled.map((token: Token) => parseInt(token.actor?.data.data['details'].level.value));

        return data;
    }

    protected onControlToken() {
        setTimeout(this.render.bind(this), 0);
    }

    public activateListeners(html: JQuery) {
        super.activateListeners(html);

        const handler = (event) => {
            const target = $(event.target);
            const rollName = target.data('rollname') as string;
            const token = (canvas as Canvas).tokens?.controlled[0];
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
                        create: true,
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
