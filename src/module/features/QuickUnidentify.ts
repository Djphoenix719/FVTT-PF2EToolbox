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

import { PF2E_LOOT_SHEET_NAME, PF2E_PC_SHEET_NAME } from '../Constants';

export function readyQuickUnidentify() {
    const decorate = (cls) => {
        const newCls = class extends cls {
            async _onDrop(event: DragEvent) {
                // @ts-ignore
                const actor: Actor = this.actor;
                const existing = actor.items.map((i: Item) => i.id) as string[];
                await super._onDrop(event);

                if (event.altKey && game.user?.isGM) {
                    const newItems = actor.items.filter((i: Item) => !existing.includes(i.id as string)) as Item[];
                    const updates: any[] = [];
                    for (const item of newItems) {
                        updates.push({
                            _id: item._id,
                            data: {
                                ['identification']: {
                                    status: 'unidentified',
                                    identified: {
                                        name: item.name,
                                    },
                                },
                            },
                        });
                    }
                    await actor.updateOwnedItem(updates, {});
                }
            }
        };
        Object.defineProperty(newCls, 'name', { value: cls.constructor.name });
        return newCls;
    };

    // @ts-ignore
    CONFIG.Actor.sheetClasses['loot'][`pf2e.${PF2E_LOOT_SHEET_NAME}`].cls = decorate(CONFIG.Actor.sheetClasses['loot'][`pf2e.${PF2E_LOOT_SHEET_NAME}`].cls);

    // @ts-ignore
    CONFIG.Actor.sheetClasses['character'][`pf2e.${PF2E_PC_SHEET_NAME}`].cls = decorate(
        CONFIG.Actor.sheetClasses['character'][`pf2e.${PF2E_PC_SHEET_NAME}`].cls,
    );
}
