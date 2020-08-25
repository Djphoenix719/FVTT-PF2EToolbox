/* Copyright 2020 Andrew Cuccinello
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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

import RollApp from './roll-app/RollApp';
import { MODULE_NAME } from './Constants';
import Settings from './Settings';
import { scaleNPCToLevel } from './cr-scaler/NPCScaler';

Hooks.on('init', Settings.registerAllSettings);

Hooks.on('setup', async () => {
    // prettier-ignore
    const templatePaths = [
        `modules/${MODULE_NAME}/templates/roll-app/index.html`,
        `modules/${MODULE_NAME}/templates/roll-app/cell.html`,
        `modules/${MODULE_NAME}/templates/roll-app/table.html`,
    ];
    await loadTemplates(templatePaths);

    Handlebars.registerPartial('rollAppTable', `{{> "modules/${MODULE_NAME}/templates/roll-app/table.html"}}`);
    Handlebars.registerPartial('rollAppCell', `{{> "modules/${MODULE_NAME}/templates/roll-app/cell.html"}}`);
});

Hooks.on('setup', () => {
    Handlebars.registerHelper('includes', function (array: any[], value: any, options: any) {
        if (array.includes(value)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });

    Handlebars.registerHelper('isNaN', function (context, options) {
        if (isNaN(context) && !(typeof context === 'string')) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('undefined', function () {
        return undefined;
    });

    Handlebars.registerHelper('hasKey', function (context, key) {
        for (const prop of context) {
            if (prop.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    });
});

Hooks.on('setup', () => {
    if (Settings.get(Settings.ENABLED_FEATURES.NPC_SCALER)) {
        Hooks.on('getActorDirectoryEntryContext', onScaleNPCContextHook);
    }
    if (Settings.get(Settings.ENABLED_FEATURES.QUICK_VIEW_SCENE)) {
        Hooks.on('getSceneDirectoryEntryContext', onQuickViewSceneHook);
    }
    if (Settings.get(Settings.ENABLED_FEATURES.QUANTITIES)) {
        Hooks.on('renderActorSheet', onQuantitiesHook);
    }
    if (Settings.get(Settings.ENABLED_FEATURES.ROLL_APP)) {
        Hooks.on('renderJournalDirectory', enableRollAppButton);
    }
    if (Settings.get(Settings.ENABLED_FEATURES.HERO_POINTS)) {
        Hooks.on('renderCRBStyleCharacterActorSheetPF2E', enableHeroPoints);
    }
});

function onScaleNPCContextHook(html: JQuery, buttons: any[]) {
    buttons.unshift({
        name: 'Scale to Level',
        icon: '<i class="fas fa-level-up-alt"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc';
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            // const oldLevel = actor.data.data.details.level.value;
            const oldLevel = 24;

            let d = new Dialog({
                title: 'Scale NPC',
                content:
                    `<div class="form-group"><label>Start Level</label><input id="startLevel" type="number" value="${oldLevel}" min="-1" max="24"></div>` +
                    `<div class="form-group"><label>End Level</label><input id="endLevel" type="number" value="${oldLevel}" min="-1" max="24"></div>`,
                buttons: {
                    scale: {
                        icon: '<i class="fas fa-level-up-alt"></i>',
                        label: 'Scale',
                        callback: async (html: JQuery) => {
                            ui.notifications.info(`Scaling NPC... please wait.`);
                            const startLevel = parseInt(<string>html.find('#startLevel').val());
                            const endLevel = parseInt(<string>html.find('#endLevel').val());

                            for (let i = startLevel; i <= endLevel; i++) {
                                await scaleNPCToLevel(actor, i);
                            }
                            ui.notifications.info(`Scaled ${actor.name} to levels ${startLevel} - ${endLevel}.`);
                        },
                    },
                },
                default: 'scale',
            });
            d.render(true);
        },
    });
}

function onQuickViewSceneHook(html: JQuery, buttons: any[]) {
    buttons.unshift({
        name: 'View Scene',
        icon: '<i class="fas fa-door-open"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const scene = game.scenes.get(id);

            return game.user.viewedScene != scene.id;
        },
        callback: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const scene = game.scenes.get(id);

            // @ts-ignore
            scene.view();
        },
    });
}

function onQuantitiesHook(app: ActorSheet, html: JQuery) {
    const increaseQuantity = html.find('.item-increase-quantity');
    const decreaseQuantity = html.find('.item-decrease-quantity');

    increaseQuantity.off('click');
    decreaseQuantity.off('click');

    const actor = app.actor as Actor;

    const getAmount = (event: JQuery.ClickEvent): number => {
        let amount = 1;
        if (event.shiftKey) amount *= Settings.get(Settings.KEY_SHIFT_QUANTITY);
        if (event.ctrlKey) amount *= Settings.get(Settings.KEY_CONTROL_QUANTITY);
        return amount;
    };

    increaseQuantity.on('click', (event) => {
        const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');

        if (!itemId) return;
        const item = actor.getOwnedItem(itemId);
        if (!item) return;

        const itemData = item.data.data;
        if (!hasProperty(itemData, 'quantity')) {
            throw new Error('Tried to update quantity on item that does not have quantity');
        }

        actor.updateEmbeddedEntity('OwnedItem', { '_id': itemId, 'data.quantity.value': Number(itemData.quantity.value) + getAmount(event) });
    });

    decreaseQuantity.on('click', (event) => {
        const li = $(event.currentTarget).parents('.item');
        const itemId = li.attr('data-item-id');

        if (!itemId) return;
        const item = actor.getOwnedItem(itemId);
        if (!item) return;

        const itemData = item.data.data;
        if (!hasProperty(itemData, 'quantity')) {
            throw new Error('Tried to update quantity on item that does not have quantity');
        }

        if (Number(itemData['quantity'].value) > 0) {
            actor.updateEmbeddedEntity('OwnedItem', { '_id': itemId, 'data.quantity.value': Number(itemData.quantity.value) - getAmount(event) });
        }
    });
}

function enableRollAppButton(app: Application, html: JQuery) {
    const button = $(`<button class="pf2e-gm-screen">GM Screen</button>`);
    button.on('click', () => {
        new RollApp().render(true);
    });

    let footer = html.find('.directory-footer');
    if (footer.length === 0) {
        footer = $(`<footer class="directory-footer"></footer>`);
        html.append(footer);
    }
    footer.append(button);
}

function enableHeroPoints(app: Application, html: JQuery, renderData: any) {
    renderData.data.attributes.heroPoints.max = Settings.get<number>(Settings.KEY_MAX_HERO_POINTS);

    const { rank, max }: { rank: number; max: number } = renderData.data.attributes.heroPoints;

    const iconFilled = '<i class="fas fa-hospital-symbol">';
    const iconEmpty = '<i class="far fa-circle"></i>';

    let icon = '';
    for (let i = 0; i < rank; i++) {
        icon += iconFilled;
    }
    for (let i = rank; i < max; i++) {
        icon += iconEmpty;
    }

    renderData.data.attributes.heroPoints.icon = icon;

    const hpInput = html.find('input[name="data.attributes.heroPoints.rank"]');
    const hpContent = hpInput.next('span');

    hpContent.html(icon);
    hpInput.data('max', max);
}
