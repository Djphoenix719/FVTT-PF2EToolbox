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

Hooks.on('setup', () => {
    // prettier-ignore
    const templatePaths = [
        `modules/${MODULE_NAME}/templates/roll-app/index.html`,
        `modules/${MODULE_NAME}/templates/roll-app/table.html`,
    ];

    Handlebars.registerPartial('rollAppTable', `{{> "modules/${MODULE_NAME}/templates/roll-app/table.html"}}`);

    return loadTemplates(templatePaths);
});

Hooks.on('setup', () => {
    Handlebars.registerHelper('lookupLevel', (data: any[], value: number, options: any) => {
        return options.fn(this);
    });

    Handlebars.registerHelper('eachOwn', function (obj, options) {
        let data = mergeObject(options, options.hash);
        let result = '';

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                data.key = key;
                result += options.fn(obj[key], { data: data });
            }
        }
        return result;
    });
});

Hooks.on('ready', () => {
    new RollApp().render(true);
});

Hooks.on('renderJournalDirectory', (app: Application, html: JQuery) => {
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
});
