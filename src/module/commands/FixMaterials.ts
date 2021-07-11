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

import { ChatCommand } from '../../../FVTT-Common/src/module/chat-command/ChatCommand';
import ModuleSettings from '../../../FVTT-Common/src/module/settings-app/ModuleSettings';
import { MATERIALS_FIXED } from '../Setup';

export class FixMaterials extends ChatCommand {
    get CommandName(): string {
        return 'fix-materials';
    }

    protected async run(args: string[]): Promise<void> {
        return fixMaterials();
    }
}

export async function fixMaterials() {
    const badMaterials = ['cloth', 'metal', 'leather', 'wood'];
    const isBad = (item: Item) => {
        return badMaterials.includes(item.data?.data?.['preciousMaterial']?.value);
    };
    const fixItem = async (item: Item) => {
        try {
            await item.update({
                [`data.preciousMaterial.value`]: '',
            });
        } catch (e) {}
    };

    let count = 0;
    for (const scene of (game.scenes as Scenes).values()) {
        for (const token of scene.data.tokens.values()) {
            if (token.data.actorLink) {
                continue;
            }

            if (token.actor && token.actor.data && token.actor.data.items) {
                for (const item of token.actor.data.items) {
                    if (isBad(item)) {
                        await fixItem(item);
                        count += 1;
                    }
                }
            }
        }
    }

    for (const actor of game.actors as Actors) {
        for (const item of actor.items) {
            if (isBad(item)) {
                await fixItem(item);
                count += 1;
            }
        }
    }

    for (const item of game.items as Items) {
        if (isBad(item)) {
            await fixItem(item);
            count += 1;
        }
    }

    if (count > 0) {
        ui.notifications?.info(`PF2E Toolbox fixed ${count} items with invalid materials.`);
    }

    await ModuleSettings.instance.set(MATERIALS_FIXED, true);
}
