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

import Settings from '../settings-app/Settings';
import { PF2E_PC_SHEET_NAME } from '../Constants';

export const setupHeroPoints = () => Hooks.on(`render${PF2E_PC_SHEET_NAME}`, onSheetRender);

function onSheetRender(app: Application, html: JQuery, renderData: any) {
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
