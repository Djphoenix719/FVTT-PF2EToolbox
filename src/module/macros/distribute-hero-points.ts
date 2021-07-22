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

import { MAX_HERO_POINTS } from '../Setup';
import ModuleSettings from '../../../FVTT-Common/src/module/ModuleSettings';

export async function distributeHeroPoints(amount: number) {
    const selected = (canvas as Canvas).tokens?.controlled as Token[];
    const max: number = ModuleSettings.instance.get(MAX_HERO_POINTS);

    const distribute = async (amount: number) => {
        for (const token of selected) {
            const actor = token.actor;

            const heroPoints = actor?.data.data['attributes'].heroPoints;
            if (heroPoints === undefined) {
                continue;
            }

            const { rank } = heroPoints;
            if (rank === undefined) {
                continue;
            }

            if (rank === max) {
                continue;
            }

            await actor?.update({
                ['data.attributes.heroPoints.rank']: Math.min(rank + amount, max),
            });
        }
    };

    if (amount === undefined) {
        let content = `<div style="display: flex; line-height: 2rem;">
        <label style="flex-grow: 1; padding-right: 8px;" for="dialogAmount">Amount</label>
        <input type="number" style="height: 2rem;" id="dialogAmount">
        </div>`;

        let d = new Dialog({
            title: `Distribute Hero Point(s)`,
            content,
            buttons: {
                distribute: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Distribute',
                    callback: async (html: JQuery) => {
                        const input = html.find('#dialogAmount');
                        const amount = input.val() as string;
                        await distribute(parseInt(amount));
                    },
                },
            },
            default: 'distribute',
        });
        d.render(true);
    } else {
        await distribute(amount);
    }
}
