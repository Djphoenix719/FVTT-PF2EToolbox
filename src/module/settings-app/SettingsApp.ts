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

import { MODULE_NAME } from '../Constants';
import Settings, { FEATURES } from './Settings';

export default class SettingsApp extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.title = 'PF2E Toolbox Settings';
        options.template = `modules/${MODULE_NAME}/templates/settings-app/SettingsApp.html`;
        options.classes = options.classes ?? [];
        options.classes = [...options.classes, 'pf2e-toolbox', 'settings-app'];
        options.tabs = [
            {
                navSelector: `.settings-app-nav`,
                contentSelector: `.settings-app-body`,
                initial: `about`,
            },
        ];
        options.width = 600;
        options.height = 800;
        return options;
    }

    constructor(object: object | undefined, options?: FormApplicationOptions) {
        if (object === undefined) {
            object = {};
        }

        super(object, options);
    }

    getData(options?: object): object {
        const renderData = super.getData(options);

        let features = duplicate(FEATURES);
        for (const setting of features) {
            for (const input of setting.inputs) {
                input['value'] = Settings.get(input.name);
            }
        }
        renderData['features'] = features;

        return renderData;
    }

    protected async _updateObject(event: JQuery.Event, formData: any): Promise<void> {
        for (const [key, value] of Object.entries(formData)) {
            await Settings.set(key, value);
        }
    }
}
