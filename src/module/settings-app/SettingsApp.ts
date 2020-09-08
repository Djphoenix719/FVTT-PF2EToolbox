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
import Settings from './Settings';

type IFeatureInputType = 'checkbox';
interface IFeatureAttribute {
    icon: string;
    title: string;
}
interface IFeatureInput {
    name: string;
    label: string;
    type: IFeatureInputType;
    value: any;
}
interface IFeatureDefinition {
    name: string;
    attributes?: IFeatureAttribute[];
    description: string;
    inputs: IFeatureInput[];
    help?: string;
}

const ATTR_RELOAD_REQUIRED: IFeatureAttribute = {
    icon: 'fas fa-sync',
    title: 'Reload Required',
};

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
                initial: `features`,
            },
        ];
        options.width = 600;
        options.height = 'auto';
        options.resizable = true;
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

        let features: IFeatureDefinition[] = [
            {
                name: 'Disable PFS Tab',
                attributes: [ATTR_RELOAD_REQUIRED],
                description: `Hide the button to access the Pathfinder Society tab of the player character sheet.`,
                inputs: [
                    {
                        name: Settings.FEATURES.DISABLE_PFS_TAB,
                        label: 'Disable?',
                        type: 'checkbox',
                        value: Settings.get(Settings.FEATURES.DISABLE_PFS_TAB),
                    },
                ],
                help:
                    'Does not disable any features of the PFS tab, only hides it. If the PFS tab imposes mechanical' +
                    ' changes to a character they will still apply.',
            },
        ];

        renderData['features'] = features;

        return renderData;
    }

    protected async _updateObject(event: JQuery.Event, formData: any): Promise<void> {}

    protected activateListeners(html: JQuery) {
        super.activateListeners(html);
    }
}
