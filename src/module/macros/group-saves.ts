/*
 * Copyright 2022 Andrew Cuccinello
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

import { ActorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs';

type SaveType = 'fortitude' | 'reflex' | 'will';
enum SuccessLevel {
    'None' = 0,
    'CriticalFailure' = 1,
    'Failure' = 2,
    'Success' = 3,
    'CriticalSuccess' = 4,
}

export async function groupSave(saveType?: SaveType) {
    const selected = (canvas as Canvas).tokens?.controlled as Token[];

    const roll = async (saveType: SaveType, dc?: number, damage?: number) => {
        let message = '<div class="pf2e-toolbox.group-roll">';
        for (const token of selected) {
            const actor: Actor = token.actor as Actor;
            const save = actor.data.data['saves'][saveType];

            if (save === undefined) {
                continue;
            }

            const { totalModifier, breakdown } = save;

            message += await formatRowOutput(token, totalModifier, breakdown, dc, damage);
        }
        message += '</div>';

        await ChatMessage.create({
            user: game.user?.id,
            content: message,
            whisper: [game.user?.id as string],
        });
    };

    if (saveType === undefined) {
        const divStyle = `
            display: flex;
            line-height: 2rem;
        `;
        const content = `
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px;" for="dialogType">Type</label>
                <select style="height: 2rem;" id="dialogType">
                    <option value="fortitude">Fortitude</option>
                    <option value="reflex">Reflex</option>
                    <option value="will">Will</option>
                </select>
            </div>
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px; white-space: nowrap" for="dialogType">DC (optional)</label>
                <input type="number" style="height: 2rem;" id="dialogDC">
            </div>
            <div style="${divStyle}">
                <label style="flex-grow: 1; padding-right: 8px; white-space: nowrap" for="dialogType">Damage (optional)</label>
                <input type="number" style="height: 2rem;" id="dialogDamage">
            </div>
        `;

        let d = new Dialog({
            title: `Group Roll`,
            content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-dice-d20"></i>',
                    label: 'Roll',
                    callback: async (html: JQuery) => {
                        const saveTypeInput = html.find('#dialogType');
                        const saveType = saveTypeInput.val() as SaveType;
                        const dcInput = html.find('#dialogDC');
                        const dc = dcInput.val() as string;
                        const damageInput = html.find('#dialogDamage');
                        const damage = damageInput.val() as string;

                        await roll(saveType, dc === '' ? undefined : parseInt(dc), damage === '' ? undefined : parseInt(damage));
                    },
                },
            },
            default: 'roll',
        });
        d.render(true);
    } else {
        await roll(saveType);
    }
}

function getSuccessLevel(total: number, dc?: number): SuccessLevel {
    if (dc === undefined) return SuccessLevel.None;
    if (total >= dc + 10) return SuccessLevel.CriticalSuccess;
    if (total >= dc) return SuccessLevel.Success;
    if (total >= dc - 10) return SuccessLevel.Failure;
    return SuccessLevel.CriticalFailure;
}

const backgroundColors = {
    [SuccessLevel.None]: 'transparent',
    [SuccessLevel.CriticalFailure]: 'darkkhaki',
    [SuccessLevel.Failure]: 'khaki',
    [SuccessLevel.Success]: 'palegreen',
    [SuccessLevel.CriticalSuccess]: 'lime',
};
const successDescription = {
    [SuccessLevel.None]: '',
    [SuccessLevel.CriticalFailure]: 'Critical failure',
    [SuccessLevel.Failure]: 'Failure',
    [SuccessLevel.Success]: 'Success',
    [SuccessLevel.CriticalSuccess]: 'Critical success',
};

async function formatRowOutput(token: Token, mod: number, breakdown: string, dc?: number, damage?: number) {
    const d20Value: number = (await new Roll('1d20', { async: true }).roll()).total as number;
    const totalValue: number = d20Value + mod;
    const successLevel = getSuccessLevel(totalValue, dc);

    // @ts-ignore
    const sceneId: number = game.scenes.viewed.id;

    const flexStyle = `
        display: flex;
        justify-content: space-between;
    `;
    const rowStyle = `
        padding: 2px;
        border: 1px solid darkgrey;
        margin: 0;
        background-color: ${backgroundColors[successLevel]};
        ${flexStyle}
    `;
    const buttonStyle = `
        font-size: 10px;
        height: 22px;
        width: 22px;
        margin-right: 0;
    `;
    const iconStyle = `
        top: 0;
        left: -1px;
    `;

    let output = `<span style="font-weight: bold; ${flexStyle}">${token.actor?.name}<span>${successDescription[successLevel]}</span></span>`;
    output += `
        <div style="${rowStyle}" data-token-id="${token.id}" data-scene-id="${sceneId}" data-damage="${damage}">
            <span>
                <span title="${d20Value}">1d20</span> + <span title="${breakdown}">${mod}</span> = <strong>${totalValue}</strong>
            </span>
            <div class="chat-damage-buttons">
                <button style="${buttonStyle}" type="button" class="full-damage" title="Apply full damage to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart-broken"></i>
                </button>
                <button style="${buttonStyle}" type="button" class="half-damage" title="Apply half damage to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart-broken"></i>
                    <span style="width: 8px;height: 12px;top: 4px;left: 50%;" class="transparent-half"></span>
                </button>
                <button style="${buttonStyle}" type="button" class="double-damage" title="Apply double damage to selected tokens.">
                    <img style="${iconStyle}" src="systems/pf2e/icons/damage/double.svg">
                </button>
                <button style="${buttonStyle}" type="button" class="heal-damage" title="Apply full healing to selected tokens.">
                    <i style="${iconStyle}" class="fas fa-heart"></i>
                    <span style="font-size: 7px;top: 7px;" class="plus">+</span>
                </button>
            </div>
        </div>
    `;

    // <button style="${buttonStyle}" type="button" class="shield-block dice-total-shield-btn tooltipstered" data-tooltip-content="li.chat-message[data-message-id=&quot;fF1jMrqtGxT6irh4&quot;] div.hover-content" title="Toggle the shield block status of the selected tokens.">
    //     <i style="${iconStyle}" class="fas fa-shield-alt"></i>
    // </button>

    return output;
}

const damageButtonStyle = `
    width: 22px;
    height: 22px;
    font-size: 10px;
    line-height: 1px;
    margin: 0;
    background: rgba(255, 255, 240, 1);
`;
export function registerGroupSaveHooks() {
    Hooks.on('renderChatMessage', (message, html: JQuery, data) => {
        const content = html.children('div.message-content').children('div');

        const apply = async (tokenId: string, sceneId: string, amount: number, shieldBlock: boolean) => {
            const scene = game.scenes?.get(sceneId)!;
            const token = scene.getEmbeddedDocument('Token', tokenId) as TokenDocument;
            if (token === undefined || token === null) {
                return;
            }

            let actorData = token.actor?.data as ActorData;

            let actor = game.actors?.get(token.data.actorId!) as Actor;
            if (isObjectEmpty(actorData) || token['actorLink'] || actorData?.data['attributes']['hp'].value === undefined) {
                actorData = actor.data;
            }

            // function getFirstEquippedShield() {
            //     return (actor as any).data.items
            //         .filter((item: Item) => item.type === 'armor')
            //         .filter((armor) => armor.data.armorType.value === 'shield')
            //         .find((shield) => shield.data.equipped.value);
            // }
            //
            // // Calculate shield reduction if it is active and not a heal
            // if (shieldBlock && amount > 0) {
            //     const shield = getFirstEquippedShield();
            //     const hardness = parseInt(shield.data.hardness.value);
            //     amount = Math.max(amount - hardness, 0);
            //
            //     if (token['actorLink']) {
            //         let shieldHp = Math.max(parseInt(actor.data.data['attributes'].shield.value) - amount, 0);
            //         await actor.update({
            //             'data.attributes.shield.value': shieldHp,
            //         });
            //     } else {
            //         // Pass, not dealing with this. Only support it for linked tokens.
            //     }
            // }

            const minHp = 0;
            const maxHp = parseInt(actorData.data['attributes'].hp.max);
            let newHp = Math.clamped(actorData.data['attributes'].hp.value - amount, minHp, maxHp);

            if (token.data.actorLink) {
                await actor.update({
                    'data.attributes.hp.value': newHp,
                });
            } else {
                await scene?.updateEmbeddedDocuments('Token', [
                    {
                        '_id': token.id,
                        'actorData.data.attributes.hp.value': newHp,
                    },
                ]);
            }
        };

        if (content.hasClass('pf2e-toolbox.group-roll')) {
            const rows = content.children('div');
            rows.each((index, element) => {
                let jElement = $(element);
                const tokenId = jElement.data('token-id') as string;
                const sceneId = jElement.data('scene-id') as string;
                const damage = jElement.data('damage');

                if (damage !== 'undefined') {
                    const full = jElement.find('button.full-damage');
                    const half = jElement.find('button.half-damage');
                    const double = jElement.find('button.double-damage');
                    const heal = jElement.find('button.heal-damage');
                    // const shield = jElement.find('button.shield-block');

                    let shieldBlock = false;
                    full.on('click', (event) => {
                        apply(tokenId, sceneId, damage, shieldBlock);

                        heal.css('opacity', 0.5);
                        full.css('opacity', 1);
                        half.css('opacity', 0.5);
                        double.css('opacity', 0.5);
                    });
                    half.on('click', (event) => {
                        apply(tokenId, sceneId, Math.floor(damage / 2), shieldBlock);

                        heal.css('opacity', 0.5);
                        full.css('opacity', 0.5);
                        half.css('opacity', 1);
                        double.css('opacity', 0.5);
                    });
                    double.on('click', (event) => {
                        apply(tokenId, sceneId, damage * 2, shieldBlock);

                        heal.css('opacity', 0.5);
                        full.css('opacity', 0.5);
                        half.css('opacity', 0.5);
                        double.css('opacity', 1);
                    });
                    // shield.on('click', (event) => {
                    //     shieldBlock = !shieldBlock;
                    //     shield.css('opacity', shieldBlock ? 1.0 : 0.5);
                    // });
                    heal.on('click', (event) => {
                        apply(tokenId, sceneId, -damage, shieldBlock);

                        heal.css('opacity', 1);
                        full.css('opacity', 0.5);
                        half.css('opacity', 0.5);
                        double.css('opacity', 0.5);
                    });
                }
            });
        }
    });
}
