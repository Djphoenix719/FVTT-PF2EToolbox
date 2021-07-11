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
import { TOKEN_PATH, TOKEN_TARGET, TOKEN_TARGET_BUCKET } from '../Setup';

export const setupTokens = () => Hooks.on('getActorDirectoryEntryContext', onSetupTokensContextHook);

function onSetupTokensContextHook(html: JQuery, buttons: any[]) {
    buttons.unshift({
        name: 'Setup Token',
        icon: '<i class="fas fa-wrench"></i>',
        condition: (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = (game as Game).actors?.get(id);

            return actor?.data.type === 'npc';
        },
        callback: async (li: JQuery<HTMLLIElement>) => {
            const id = li.data('entity-id') as string;
            const actor = (game as Game).actors?.get(id);

            await setupActorToken(actor as Actor);
        },
    });
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
        path = decodeURIComponent(path);
        let regex = `${basePath}/(${parts.join('_')})_01\\.(jpg|jpeg|png|gif|webp|svg)`;
        regex = decodeURIComponent(regex);

        for (const file of files) {
            const name = decodeURIComponent(file);
            const match = name.match(regex);

            if (match) {
                return `${basePath}/${match[1]}_??.${match[2]}`;
            }
        }

        pop.call(parts);
    }

    return null;
}

export async function setupActorToken(actor: Actor): Promise<void> {
    let basePath = ModuleSettings.instance.get(TOKEN_PATH);
    const folderTarget = ModuleSettings.instance.get(TOKEN_TARGET);

    let options: undefined | object;
    let browseUrl: string = basePath;
    if (folderTarget === 's3') {
        browseUrl = basePath.split('/')[basePath.split('/').length - 1];
        options = {
            bucket: ModuleSettings.instance.get(TOKEN_TARGET_BUCKET),
        };
    }

    let files: string[] = ((await FilePicker.browse(folderTarget, browseUrl, options)) as any).files;

    const actorLink: boolean = actor.data.token['actorLink'];

    const actorUpdate: object = {
        ['token.randomImg']: !actorLink,
    };

    let path: string | null = getValidName(actor.name as string, basePath, files);
    if (path === null) {
        path = getValidName(actor.name as string, basePath, files, true);
    }

    if (path === null) {
        ui.notifications?.warn(`Could not find a token image for ${actor.name}.`);
        return;
    } else {
        if (folderTarget === 's3') {
            path = path.replace(`??.png`, '01.png');
            actorUpdate['token.randomImg'] = false;
        }

        actorUpdate['token.img'] = path;
    }

    await actor.update(actorUpdate);

    ui.notifications?.info(`Updated ${actor.name} to use image path "${path}"`);
}
