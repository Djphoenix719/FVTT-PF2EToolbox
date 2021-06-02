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

import RollApp from '../roll-app/RollApp';

export const setupRollApp = () => Hooks.on('renderJournalDirectory', enableRollAppButton);

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
