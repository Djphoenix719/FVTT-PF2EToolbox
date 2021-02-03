const SKILL_DICTIONARY = Object.freeze({
    acr: 'acrobatics',
    arc: 'arcana',
    ath: 'athletics',
    cra: 'crafting',
    dec: 'deception',
    dip: 'diplomacy',
    itm: 'intimidation',
    med: 'medicine',
    nat: 'nature',
    occ: 'occultism',
    prf: 'performance',
    rel: 'religion',
    soc: 'society',
    ste: 'stealth',
    sur: 'survival',
    thi: 'thievery',
});

export default async function secretSkillRoll(skillName?: string) {
    let actor: Actor = canvas.tokens.controlled[0]?.actor ?? game.user.character;

    if (actor === null || actor === undefined) {
        ui.notifications.error('You must set your active character in the player configuration or select a token.');
        return;
    }

    const skills = actor.data.data.skills;
    const attributes = actor.data.data.attributes;

    const rollSkill = async (skillName: string) => {
        // @ts-ignore
        const opts = actor.getRollOptions(['all', 'skill-check', SKILL_DICTIONARY[skillName] ?? skillName]);
        actor.data.data.skills[skillName].roll({ event: new Event('click'), options: [...opts, 'secret'] });
    };

    const rollAttr = async (attrName: string) => {
        // @ts-ignore
        const opts = actor.getRollOptions(['all', attrName]);
        // @ts-ignore
        actor.data.data.attributes[attrName].roll({ event: new Event('click'), options: [...opts, 'secret'] });
    };

    if (typeof skillName !== 'string') {
        const options = Object.keys(skills).map((key) => {
            return {
                key: key,
                label: skills[key].lore ? `Lore: ${skills[key].name.capitalize()}` : skills[key].name.capitalize(),
            };
        });
        options.push({
            key: 'perception',
            label: 'Perception',
        });
        options.sort((a, b) => a.label.localeCompare(b.label));

        let content = `<div style="display: flex; line-height: 2rem;">
        <label style="flex-grow: 1;" for="dialogSkillId">Skill</label>
        <select style="height: 2rem;" id="dialogSkillId">`;
        for (let { key, label } of options) {
            content += `<option value=${key}>${label}</option>`;
        }
        content += `</div></select>`;

        let d = new Dialog({
            title: `${actor.name}: Secret Skill Check`,
            content,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Roll',
                    callback: async (html: JQuery) => {
                        const select = html.find('#dialogSkillId');
                        const skillName = select.val() as string;
                        if (skillName === 'perception') {
                            await rollAttr(skillName);
                        } else {
                            await rollSkill(skillName);
                        }
                    },
                },
            },
            default: 'roll',
        });
        d.render(true);
    } else {
        if (skills.hasOwnProperty(skillName)) {
            await rollSkill(skillName);
        } else if (attributes.hasOwnProperty(skillName)) {
            await rollAttr(skillName);
        } else {
            ui.notifications.error(
                `Invalid roll: "${skillName}". Use one of the following: 
            ${[...Object.keys(actor.data.data.skills), 'perception'].join(', ')}`,
                { permanent: true },
            );
        }
    }
}
