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

    Handlebars.registerHelper('object', function ({ hash }) {
        return hash;
    });
    Handlebars.registerHelper('array', function () {
        return Array.from(arguments).slice(0, arguments.length - 1);
    });

    Handlebars.registerHelper('ife', function (v1, v2, options) {
        if (v1 === v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifge', function (v1, v2, options) {
        if (v1 >= v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('iflt', function (v1, v2, options) {
        if (v1 < v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifle', function (v1, v2, options) {
        if (v1 <= v2) return options.fn(this);
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

Hooks.on('ready', () => {
    setTimeout(() => {
        new RollApp().render(true);
    }, 1000);
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
