import Settings from '../Settings';
import { getActor, getDamageData, getFolder, getFolderInFolder, getHPData, getLeveledData } from './NPCScalerUtil';

export async function scaleNPCToLevel(actor: Actor, newLevel: number) {
    const root = getFolder(Settings.get(Settings.KEY_SCALED_OUTPUT_FOLDER));

    const folderName = `Level ${newLevel}`;
    const folder =
        getFolderInFolder(folderName, root?.name) ??
        (await Folder.create({
            name: folderName,
            type: 'Actor',
            parent: root ? root.id : '',
        }));

    let oldLevel = parseInt(actor.data.data.details.level.value);
    const data = {
        folder: folder.id,
        ['data.details.level.value']: newLevel,
    };

    // parse attribute modifiers
    for (const [key, attr] of Object.entries(actor.data.data.abilities)) {
        const mod = getLeveledData('abilityScore', parseInt((attr as any).mod), oldLevel, newLevel).total;
        const value = 10 + mod * 2;
        const min = 3;

        data[`data.abilities.${key}`] = { value, min, mod };
    }

    // parse simple modifiers
    data['data.attributes.ac.base'] = getLeveledData('armorClass', parseInt(actor.data.data.attributes.ac.base), oldLevel, newLevel).total;
    data['data.attributes.perception.base'] = getLeveledData('perception', parseInt(actor.data.data.attributes.perception.base), oldLevel, newLevel).total;
    // parse simple saves
    data['data.saves.fortitude.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.fortitude.base), oldLevel, newLevel).total;
    data['data.saves.reflex.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.reflex.base), oldLevel, newLevel).total;
    data['data.saves.will.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.will.base), oldLevel, newLevel).total;

    const hp = getHPData(parseInt(actor.data.data.attributes.hp.max), oldLevel, newLevel);
    data['data.attributes.hp.max'] = hp;
    data['data.attributes.hp.value'] = hp;

    let itemUpdates: { _id: string; [key: string]: any }[] = [];
    for (const item of actor.items.filter((i) => i.type === 'lore')) {
        const oldValue = parseInt(item.data.data.mod.value);
        const updatedSkill = getLeveledData('skill', oldValue, oldLevel, newLevel);
        itemUpdates.push({
            _id: item.id,
            ['data.mod.value']: updatedSkill.total,
        });
    }

    for (const item of actor.items.filter((i) => i.type === 'spellcastingEntry')) {
        const oldAttack = parseInt(item.data.data.spelldc.value);
        const newAttack = getLeveledData('spell', oldAttack, oldLevel, newLevel);

        const oldDC = parseInt(item.data.data.spelldc.dc);
        const newDC = getLeveledData('difficultyClass', oldDC, oldLevel, newLevel);

        itemUpdates.push({
            _id: item.id,
            ['data.spelldc.value']: newAttack.total,
            ['data.spelldc.dc']: newDC.total,
        });
    }

    for (const item of actor.items.filter((i) => i.type === 'melee')) {
        const oldAttack = parseInt(item.data.data.bonus.value);
        const newAttack = getLeveledData('spell', oldAttack, oldLevel, newLevel);

        const attackUpdate: { _id: string; [key: string]: any } = {
            _id: item.id,
            ['data.bonus.value']: newAttack.total,
            ['data.bonus.total']: newAttack.total,
        };

        const damage = item.data.data.damageRolls as any[];
        for (let i = 0; i < damage.length; i++) {
            attackUpdate[`data.damageRolls.${i}.damage`] = getDamageData(damage[i].damage, oldLevel, newLevel);
            attackUpdate[`data.damageRolls.${i}.damageType`] = damage[i].damageType;
        }
        itemUpdates.push(attackUpdate);
    }

    let newActor: Actor | null = getActor(actor.name, folder.name);
    if (newActor !== null) {
        await newActor.update(data);
    } else {
        newActor = await actor.clone(data);
    }

    for (const itemUpdate of itemUpdates) {
        await newActor.updateOwnedItem(itemUpdate);
    }

    itemUpdates = [];
    for (const item of actor.items.filter((i) => i.data.data.description.value.includes('DC'))) {
        const DC_REGEX = /(DC)\s([0-9]+)/g;
        const description = item.data.data.description.value as string;
        let newDescription = description;
        let match: RegExpExecArray | null = DC_REGEX.exec(description);
        while (match !== null) {
            const index = match.index;
            const [fullMatch, dcPart, valuePart] = match;
            const newDCValue = getLeveledData('difficultyClass', parseInt(valuePart), oldLevel, newLevel).total;
            const newDCString = `${dcPart} ${newDCValue}`;

            newDescription = newDescription.substr(0, index) + newDCString + newDescription.substr(index + fullMatch.length);
            match = DC_REGEX.exec(description);
        }

        itemUpdates.push({
            _id: item.id,
            ['data.description.value']: newDescription,
        });
    }

    for (const itemUpdate of itemUpdates) {
        await newActor.updateOwnedItem(itemUpdate);
    }

    itemUpdates = [];
    for (const item of newActor.items.values()) {
        const DC_REGEX = /[0-9]+d[0-9]+(\+[0-9]*)?/g;
        const description = item.data.data.description.value as string;
        let newDescription = description;
        let match: RegExpExecArray | null = DC_REGEX.exec(description);
        while (match !== null) {
            const index = match.index;
            const [fullMatch] = match;
            const newDamageFormula = getDamageData(fullMatch, oldLevel, newLevel);

            newDescription = newDescription.substr(0, index) + newDamageFormula + newDescription.substr(index + fullMatch.length);

            match = DC_REGEX.exec(description);
        }

        itemUpdates.push({
            _id: item.id,
            ['data.description.value']: newDescription,
        });
    }

    for (const itemUpdate of itemUpdates) {
        await newActor.updateOwnedItem(itemUpdate);
    }

    await newActor.update({
        ['token.displayBars']: 40,
        ['token.displayName']: 50,
        ['token.disposition']: -1,

        ['token.randomImg']: true,
        ['token.vision']: false,
        ['token.dimSight']: 120,
        ['token.brightSight']: 60,
    });
}
