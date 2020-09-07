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
import Settings from './settings-app/Settings';
import { scaleNPCToLevel } from './cr-scaler/NPCScaler';
import { onSetupTokensContextHook } from './Tokens';
import extendLootSheet from './loot-app/LootApp';
import { IDataUpdates, IHandledItemType } from './cr-scaler/NPCScalerTypes';
import { registerHandlebarsHelpers, registerHandlebarsTemplates } from './Handlebars';

Hooks.on('init', Settings.registerAllSettings);

Hooks.on('setup', registerHandlebarsTemplates);
Hooks.on('setup', registerHandlebarsHelpers);

Hooks.on('setup', () => {
    if (Settings.get(Settings.FEATURES.NPC_SCALER)) {
        Hooks.on('getActorDirectoryEntryContext', onScaleNPCContextHook);
    }
    if (Settings.get(Settings.FEATURES.FLATTEN_PROFICIENCY)) {
        Hooks.on('getActorDirectoryEntryContext', onFlattenProficiencyContextHook);
    }
    if (Settings.get(Settings.FEATURES.TOKEN_SETUP)) {
        Hooks.on('getActorDirectoryEntryContext', onSetupTokensContextHook);
    }
    if (Settings.get(Settings.FEATURES.QUICK_VIEW_SCENE)) {
        Hooks.on('getSceneDirectoryEntryContext', onQuickViewSceneHook);
    }
    if (Settings.get(Settings.FEATURES.QUANTITIES)) {
        Hooks.on('renderActorSheet', onQuantitiesHook);
    }
    if (Settings.get(Settings.FEATURES.ROLL_APP)) {
        Hooks.on('renderJournalDirectory', enableRollAppButton);
    }
    if (Settings.get(Settings.FEATURES.HERO_POINTS)) {
        Hooks.on('renderCRBStyleCharacterActorSheetPF2E', enableHeroPoints);
    }
    if (Settings.get(Settings.FEATURES.DISABLE_PFS_TAB)) {
        Hooks.on('renderCRBStyleCharacterActorSheetPF2E', disablePFSTab);
    }
    if (Settings.get(Settings.FEATURES.REMOVE_DEFAULT_ART)) {
        Hooks.on('ready', removeDefaultArt);
    }
    if (Settings.get(Settings.FEATURES.LOOT_APP)) {
        Hooks.on('ready', enableLootApp);
    }

    Hooks.on('ready', () => {
        if (Settings.get(Settings.FEATURES.QUICK_MYSTIFY)) {
            if (!window['ForienIdentification']) {
                ui.notifications.error("PF2E Toolbox quick mystify enabled but Forien's Unidentified Items was not detected.", { permanent: true });
                Settings.set(Settings.FEATURES.QUICK_MYSTIFY, false);
                return;
            }

            enableQuickMystify();
        }
    });

    // Hooks.on('ready', () => {
    //     setTimeout(() => (game.actors.getName('Loot') as Actor).sheet.render(true), 500);
    // });
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
        if (event.shiftKey) amount *= Settings.get(Settings.SHIFT_QUANTITY);
        if (event.ctrlKey) amount *= Settings.get(Settings.CONTROL_QUANTITY);
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
    const button = $(`<button class="pf2e-gm-screen"><i class="fas fa-dice"></i> Quick Roller</button>`);
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
    renderData.data.attributes.heroPoints.max = Settings.get<number>(Settings.MAX_HERO_POINTS);

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

function enableQuickMystify() {
    const lootSheet = CONFIG.Actor.sheetClasses['loot']['pf2e.ActorSheetPF2eLoot'];
    lootSheet.cls = class ActorSheetPF2ELoot extends lootSheet.cls {
        async _onDrop(event: DragEvent) {
            // @ts-ignore
            const actor: Actor = this.actor;
            const existing = actor.items.map((i: Item) => i.id) as string[];
            await super._onDrop(event);

            if (event.altKey && game.user.isGM) {
                const newItems = actor.items.filter((i: Item) => !existing.includes(i.id)) as Item[];
                for (const item of newItems) {
                    window['ForienIdentification'].mystify(`Actor.${actor.id}.OwnedItem.${item.id}`, { replace: true });
                }
            }
        }
    };

    const characterSheet = CONFIG.Actor.sheetClasses['character']['pf2e.CRBStyleCharacterActorSheetPF2E'];
    characterSheet.cls = class CRBStyleCharacterActorSheetPF2E extends characterSheet.cls {
        async _onDrop(event: DragEvent) {
            // @ts-ignore
            const actor: Actor = this.actor;
            const existing = actor.items.map((i: Item) => i.id) as string[];
            await super._onDrop(event);

            if (event.altKey && game.user.isGM) {
                const newItems = actor.items.filter((i: Item) => !existing.includes(i.id)) as Item[];
                for (const item of newItems) {
                    window['ForienIdentification'].mystify(`Actor.${actor.id}.OwnedItem.${item.id}`, { replace: true });
                }
            }
        }
    };
}

function disablePFSTab(app: Application, html: JQuery) {
    for (const navTab of html.find('nav.sheet-navigation a.item')) {
        let jTab = $(navTab);
        if (jTab.data('tab') === 'pfs') {
            jTab.css('display', 'none');
            break;
        }
    }
}

async function removeDefaultArt() {
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

function enableLootApp() {
    const LootApp = extendLootSheet();

    Actors.registerSheet(MODULE_NAME, LootApp, {
        types: ['loot'],
        makeDefault: false,
    });
}

function onFlattenProficiencyContextHook(html: JQuery, buttons: any[]) {
    const modifierName = 'Proficiency Without Level';
    const hasModifier = (actor: Actor) => {
        const data = actor.data.data;
        if (data.customModifiers && data.customModifiers.all) {
            const all = data.customModifiers.all;
            for (const modifier of all) {
                if (modifier.name === modifierName) {
                    return true;
                }
            }
        }
        return false;
    };

    buttons.unshift({
        name: 'Flatten NPC',
        icon: '<i class="fas fa-level-down-alt"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc' && !hasModifier(actor);
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            const level = parseInt(actor.data.data.details.level.value);
            (actor as any).addCustomModifier('all', modifierName, -level, 'untyped');

            let itemUpdates: IDataUpdates[] = [];
            for (let i = 0; i < actor.data['items'].length; i++) {
                const item = actor.data['items'][i];

                if ((item.type as IHandledItemType) === 'melee') {
                    const oldAttack = parseInt(item.data.bonus.value);
                    const newAttack = oldAttack - level;

                    const attackUpdate: IDataUpdates = {
                        _id: item._id,
                        ['data.bonus.value']: newAttack,
                        ['data.bonus.total']: newAttack,
                    };

                    itemUpdates.push(attackUpdate);
                }
            }
            await actor.updateEmbeddedEntity('OwnedItem', itemUpdates);
        },
    });

    buttons.unshift({
        name: 'Unflatten NPC',
        icon: '<i class="fas fa-level-up-alt"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc' && hasModifier(actor);
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            const level = parseInt(actor.data.data.details.level.value);
            (actor as any).removeCustomModifier('all', modifierName);

            let itemUpdates: IDataUpdates[] = [];
            for (let i = 0; i < actor.data['items'].length; i++) {
                const item = actor.data['items'][i];

                if ((item.type as IHandledItemType) === 'melee') {
                    const oldAttack = parseInt(item.data.bonus.value);
                    const newAttack = oldAttack + level;

                    const attackUpdate: IDataUpdates = {
                        _id: item._id,
                        ['data.bonus.value']: newAttack,
                        ['data.bonus.total']: newAttack,
                    };

                    itemUpdates.push(attackUpdate);
                }
            }
            await actor.updateEmbeddedEntity('OwnedItem', itemUpdates);
        },
    });
}
