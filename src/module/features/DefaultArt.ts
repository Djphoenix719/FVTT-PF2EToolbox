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

import Settings from '../settings-app/Settings';

export async function readyDefaultArt() {
    if (game.system.data.version === Settings.get(Settings.LAST_SEEN_SYSTEM)) {
        return;
    }

    ui.notifications.info('PF2E Toolbox is removing default artwork... please wait.');

    for (const entry of game.packs.values()) {
        const pack = entry as Compendium;

        if (pack.metadata.system === 'pf2e' && pack.metadata.module === 'pf2e' && pack.metadata.entity === 'Actor') {
            pack.locked = false;

            const content = (await pack.getContent()) as Actor[];
            for (const actor of content) {
                if (actor.data.img.startsWith('systems/pf2e/icons')) {
                    await pack.updateEntity({
                        _id: actor._id,
                        img: 'icons/svg/mystery-man.svg',
                    });
                    console.log(`Updated ${actor.name}, was ${actor.img}`);
                }
            }

            pack.locked = true;
        }
    }

    await Settings.set(Settings.LAST_SEEN_SYSTEM, game.system.data.version);

    ui.notifications.info('All bestiary artwork has been updated!');
}
