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

import { DICE_ROLL_MODES } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/constants.mjs';

export function GetRollMode(): ValueOf<typeof DICE_ROLL_MODES> {
    return game.settings.get('core', 'rollMode');
}

export function getFolder(name: string): Folder | null {
    return game.folders?.getName(name) as Folder;
}
export function getFolderInFolder(name: string, parentName?: string) {
    let parent: any;
    if (parentName) {
        parent = game.folders?.getName(parentName);
        return parent.getSubfolders().find((f) => f.name === name);
    } else {
        return getFolder(name);
    }
}
export function getActor(name: string, folder: string): Actor | undefined {
    return game.actors?.find((a) => a.name === name && a.folder?.name === folder) as any;
}

export function GetFolderPath(name: string) {
    let path: Folder[] = [];
    let folder: Folder | null = getFolder(name);
    if (folder === null) {
        return [];
    }

    while (folder) {
        path.push(folder);
        folder = (folder as any).parent;
    }

    path = path.reverse();
    return {
        entities: path,
        path: path.map((folder) => folder.name).reduce((last, next) => `${last}/${next}`),
    };
}
