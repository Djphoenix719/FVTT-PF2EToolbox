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

import ModuleSettings from '../../../FVTT-Common/src/module/settings-app/ModuleSettings';
import { LAST_SEEN_SYSTEM } from '../Setup';

export async function readyDefaultArt() {
    if (game.system.data.version === ModuleSettings.instance.get(LAST_SEEN_SYSTEM)) {
        return;
    }

    ui.notifications?.info('PF2E Toolbox is removing default artwork... please wait.');

    const pathMap = {
        npc: 'systems/pf2e/icons/default-icons/npc.svg',
        hazard: 'systems/pf2e/icons/default-icons/hazard.svg',
    };

    for (const entry of game.packs.values()) {
        const pack = entry as any;

        if (pack.metadata.system === 'pf2e' && pack.metadata.package === 'pf2e' && pack.metadata.entity === 'Actor') {
            pack.configure({
                locked: false,
            });

            const documents = (await pack.getDocuments()) as Actor[];
            for (const actor of documents) {
                let path: string = actor.data.img as string;
                if (!path.includes('default-icons')) {
                    await actor.update({
                        img: pathMap[actor.data['type']],
                    });
                }
            }

            pack.configure({
                locked: true,
            });
        }
    }

    await ModuleSettings.instance.set(LAST_SEEN_SYSTEM, game.system.data.version);

    ui.notifications?.info('All bestiary artwork has been updated!');
}
