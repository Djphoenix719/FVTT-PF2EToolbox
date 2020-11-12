type SaveType = 'fortitude' | 'reflex' | 'will';
enum SuccessLevel {
    'None' = 0,
    'CriticalFailure' = 1,
    'Failure' = 2,
    'Success' = 3,
    'CriticalSuccess' = 4,
}

export async function groupSave(saveType?: SaveType) {
    const selected = canvas.tokens.controlled;

    const roll = async (saveType: SaveType, dc?: number, damage?: number) => {
        let message = '<div class="pf2e-toolbox.group-roll">';
        for (const token of selected) {
            const actor: Actor = token.actor;
            const save = actor.data.data.saves[saveType];

            if (save === undefined) {
                continue;
            }

            const { totalModifier, breakdown } = save;

            message += formatRowOutput(token, totalModifier, breakdown, dc, damage);
        }
        message += '</div>';

        await ChatMessage.create({
            content: message,
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

function formatRowOutput(token: Token, mod: number, breakdown: string, dc?: number, damage?: number) {
    const d20Value: number = new Roll('1d20').roll()._total;
    const totalValue: number = d20Value + mod;
    const successLevel = getSuccessLevel(totalValue, dc);

    const sceneId = game.scenes.active.id;

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

    let output = `<span style="font-weight: bold; ${flexStyle}">${token.actor.name}<span>${successDescription[successLevel]}</span></span>`;
    output += `
        <div style="${rowStyle}" data-token-id="${token.id}" data-scene-id="${sceneId}" data-damage="${damage}">
            <span>
                <span title="${d20Value}">1d20</span> + <span title="${breakdown}">${mod}</span> = <strong>${totalValue}</strong>
            </span>
            <span class="dmgBtn-container"></span>
        </div>
    `;

    return output;
}

const damageButtonStyle = `
    width: 22px;
    height:22px;
    font-size: 10px;
    line-height: 1px;
    margin: 0;
    background: rgba(255, 255, 240, 1);
`;
export function registerGroupSaveHooks() {
    Hooks.on('renderChatMessage', (message, html: JQuery, data) => {
        const content = html.children('div.message-content').children('div');

        const apply = async (tokenId: string, sceneId: string, amount: number, shieldBlock: boolean) => {
            const scene = game.scenes.get(sceneId);
            const token = scene.getEmbeddedEntity('Token', tokenId);

            if (token === undefined || token === null) {
                return;
            }

            let actorData = token.actorData;
            let actor = game.actors.get(token.actorId);
            if (isObjectEmpty(actorData) || token.actorLink || actorData?.data?.attributes?.hp?.value === undefined) {
                actorData = actor.data;
            }

            function getFirstEquippedShield() {
                return (actor as any).data.items
                    .filter((item: Item) => item.type === 'armor')
                    .filter((armor) => armor.data.armorType.value === 'shield')
                    .find((shield) => shield.data.equipped.value);
            }

            // Calculate shield reduction if it is active and not a heal
            if (shieldBlock && amount > 0) {
                const shield = getFirstEquippedShield();
                const hardness = parseInt(shield.data.hardness.value);
                amount = Math.max(amount - hardness, 0);

                if (token.actorLink) {
                    let shieldHp = Math.max(parseInt(actor.data.data.attributes.shield.value) - amount, 0);
                    await actor.update({
                        'data.attributes.shield.value': shieldHp,
                    });
                } else {
                    // Pass, not dealing with this. Only support it for linked tokens.
                }
            }

            const minHp = 0;
            const maxHp = parseInt(actor.data.data.attributes.hp.max);
            let newHp = Math.clamped(actorData.data.attributes.hp.value - amount, minHp, maxHp);

            if (token.actorLink) {
                await actor.update({
                    'data.attributes.hp.value': newHp,
                });
            } else {
                await scene.updateEmbeddedEntity('Token', {
                    '_id': token._id,
                    'actorData.data.attributes.hp.value': newHp,
                });
            }
        };

        if (content.hasClass('pf2e-toolbox.group-roll')) {
            const rows = content.children('div');
            rows.each((index, element) => {
                let jElement = $(element);
                const tokenId = jElement.data('token-id') as string;
                const sceneId = jElement.data('scene-id') as string;
                const damage = jElement.data('damage');

                const token = game.scenes.get(sceneId).getEmbeddedEntity('Token', tokenId);

                if (damage !== 'undefined') {
                    const container = jElement.children('span.dmgBtn-container');

                    const heal = $(`<button style="${damageButtonStyle}">
                        <i class="fas fa-heart" title="Click to apply full healing to selected token(s)."></i>
                    </button>`);

                    const full = $(`<button style="${damageButtonStyle}">
                        <i class="fas fa-bahai" title="Click to apply full damage to selected token(s)."></i>
                    </button>`);

                    const half = $(`<button style="${damageButtonStyle}">
                        <i class="fas fa-chevron-down" title="Click to apply half damage to selected token(s)."></i>
                    </button>`);

                    const double = $(`<button style="${damageButtonStyle}">
                        <i class="fas fa-angle-double-up" title="Click to apply double damage to selected token(s)."></i>
                    </button>`);

                    let shieldBlock = false;
                    if (token.actorLink) {
                        const shield = $(`<button class="dice-total-shield-btn" style="${damageButtonStyle} opacity: 0.5;">
                            <i class="fas fa-shield-alt" title="Click to toggle the shield block status of the selected token(s)."></i>
                        </button>`);
                        shield.on('click', (event) => {
                            shieldBlock = !shieldBlock;

                            shield.css('opacity', shieldBlock ? 1.0 : 0.5);
                        });

                        container.append(shield);
                    }

                    heal.on('click', (event) => {
                        apply(tokenId, sceneId, -damage, shieldBlock);

                        heal.css('opacity', 1);
                        full.css('opacity', 0.5);
                        half.css('opacity', 0.5);
                        double.css('opacity', 0.5);
                    });
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
                    container.append(heal);
                    container.append(full);
                    container.append(half);
                    container.append(double);
                }
            });
        }
    });
}
