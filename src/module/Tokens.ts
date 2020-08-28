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

import Settings from './settings-app/Settings';

declare function srcExists(path: string): Promise<boolean>;

export function onSetupTokensContextHook(html: JQuery, buttons: any[]) {
    buttons.unshift({
        name: 'Setup Token',
        icon: '<i class="fas fa-wrench"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            return actor.data.type === 'npc';
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = game.actors.get(id);

            await setupActorToken(actor);
        },
    });
}

function normalizeTokenName(actorName: string, num: number) {
    return `${actorName.replace(/\s/g, '_')}_${pad(num)}`;
}

function pad(n: number, count: number = 2) {
    let result = n.toString();
    while (result.length < count) {
        result = `0${result}`;
    }
    return result;
}

function getNameParts(name: string) {
    return name.replace(/,/g, '').split(' ');
}

function getValidName(name: string, basePath: string, files: string[], reverse: boolean = false) {
    let parts = getNameParts(name);
    const pop = reverse ? parts.shift : parts.pop;

    let path: string;
    while (parts.length > 0) {
        path = `${basePath}/${parts.join('_')}_01.png`;

        if (files.includes(path)) {
            return `${basePath}/${parts.join('_')}_??.png`;
        }

        pop.call(parts);
    }

    return null;
}

export async function setupActorToken(actor: Actor): Promise<void> {
    let basePath = Settings.get(Settings.TOKEN_PATH);
    const folderTarget = Settings.get(Settings.TOKEN_TARGET);

    let options: undefined | object;
    let browseUrl: string = basePath;
    if (folderTarget === 's3') {
        browseUrl = basePath.split('/')[basePath.split('/').length - 1];
        options = {
            bucket: Settings.get(Settings.TOKEN_TARGET_BUCKET),
        };
    }

    let files: string[] = (await FilePicker.browse(folderTarget, browseUrl, options)).files;

    const actorLink: boolean = actor.data.token['actorLink'];

    const actorUpdate: object = {
        ['token.randomImg']: !actorLink,
    };

    let path: string | null = getValidName(actor.name, basePath, files);
    if (path === null) {
        path = getValidName(actor.name, basePath, files, true);
    }

    if (path === null) {
        ui.notifications.warn(`Could not find a token image for ${actor.name}.`);
    } else {
        if (folderTarget === 's3') {
            path = path.replace(`??.png`, '01.png');
            actorUpdate['token.randomImg'] = false;
        }

        actorUpdate['token.img'] = path;
    }

    await actor.update(actorUpdate);

    ui.notifications.info(`Updated ${actor.name}`);
}
