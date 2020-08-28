import Settings from '../settings-app/Settings';
import { IDataUpdates, IHandledItemType } from './NPCScalerTypes';
import { getActor, getFolder, getFolderInFolder } from '../Utilities';
import { getDamageData, getHPData, getLeveledData, getMinMaxData } from './NPCScalerUtil';

const EMBEDDED_ENTITY_TYPE = 'OwnedItem';

export async function scaleNPCToLevel(actor: Actor, newLevel: number) {
    const rootFolder = getFolder(Settings.get(Settings.SCALED_FOLDER));

    const folderName = `Level ${newLevel}`;
    const folder =
        getFolderInFolder(folderName, rootFolder?.name) ??
        (await Folder.create({
            name: folderName,
            type: 'Actor',
            parent: rootFolder ? rootFolder.id : '',
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

    // parse resistances
    const drData: any[] = [];
    for (let i = 0; i < actor.data.data.traits.dr.length; i++) {
        const dr = actor.data.data.traits.dr[i];

        drData.push({
            label: dr.label,
            type: dr.type,
            exceptions: dr.exceptions ?? '',
            value: getMinMaxData('resistance', parseInt(dr.value), oldLevel, newLevel).toString(),
        });
    }
    data['data.traits.dr'] = drData;

    // parse vulnerabilities
    const dvData: any[] = [];
    for (let i = 0; i < actor.data.data.traits.dv.length; i++) {
        const dv = actor.data.data.traits.dv[i];

        dvData.push({
            label: dv.label,
            type: dv.type,
            exceptions: dv.exceptions ?? '',
            value: getMinMaxData('weakness', parseInt(dv.value), oldLevel, newLevel).toString(),
        });
    }
    data['data.traits.dv'] = dvData;

    // parse simple modifiers
    data['data.attributes.ac.base'] = getLeveledData('armorClass', parseInt(actor.data.data.attributes.ac.base), oldLevel, newLevel).total;
    data['data.attributes.perception.base'] = getLeveledData('perception', parseInt(actor.data.data.attributes.perception.base), oldLevel, newLevel).total;
    data['data.saves.fortitude.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.fortitude.base), oldLevel, newLevel).total;
    data['data.saves.reflex.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.reflex.base), oldLevel, newLevel).total;
    data['data.saves.will.base'] = getLeveledData('savingThrow', parseInt(actor.data.data.saves.will.base), oldLevel, newLevel).total;

    const hp = getHPData(parseInt(actor.data.data.attributes.hp.max), oldLevel, newLevel);
    data['data.attributes.hp.max'] = hp;
    data['data.attributes.hp.value'] = hp;

    let itemUpdates: IDataUpdates[] = [];
    for (let i = 0; i < actor.data['items'].length; i++) {
        const item = actor.data['items'][i];

        if ((item.type as IHandledItemType) === 'lore') {
            const oldValue = parseInt(item.data.mod.value);
            const newValue = getLeveledData('skill', oldValue, oldLevel, newLevel).total;
            itemUpdates.push({
                _id: item._id,
                ['data.mod.value']: newValue,
            });
        } else if ((item.type as IHandledItemType) === 'spellcastingEntry') {
            const oldAttack = parseInt(item.data.spelldc.value);
            const newAttack = getLeveledData('spell', oldAttack, oldLevel, newLevel).total;

            const oldDC = parseInt(item.data.spelldc.dc);
            const newDC = getLeveledData('difficultyClass', oldDC, oldLevel, newLevel).total;

            itemUpdates.push({
                _id: item._id,
                ['data.spelldc.value']: newAttack,
                ['data.spelldc.dc']: newDC,
            });
        } else if ((item.type as IHandledItemType) === 'melee') {
            const oldAttack = parseInt(item.data.bonus.value);
            const newAttack = getLeveledData('spell', oldAttack, oldLevel, newLevel).total;

            const attackUpdate: IDataUpdates = {
                _id: item._id,
                ['data.bonus.value']: newAttack,
                ['data.bonus.total']: newAttack,
            };

            const damage = item.data.damageRolls as any[] | object;

            if (Array.isArray(damage)) {
                for (let i = 0; i < damage.length; i++) {
                    attackUpdate[`data.damageRolls.${i}.damage`] = getDamageData(damage[i].damage, oldLevel, newLevel);
                    attackUpdate[`data.damageRolls.${i}.damageType`] = damage[i].damageType;
                }
            } else {
                // Fix for #2 - some actors contain key/value pairs instead of array elements
                for (const key in damage) {
                    attackUpdate[`data.damageRolls.${key}.damage`] = getDamageData(damage[key].damage, oldLevel, newLevel);
                    attackUpdate[`data.damageRolls.${key}.damageType`] = damage[key].damageType;
                }
            }

            itemUpdates.push(attackUpdate);
        }
    }

    let newActor: Actor | null = getActor(actor.name, folder.name);
    if (newActor !== null) {
        await newActor.update(data);
    } else {
        newActor = await actor.clone(data);
    }

    await newActor.updateEmbeddedEntity(EMBEDDED_ENTITY_TYPE, itemUpdates);

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

    await newActor.updateEmbeddedEntity(EMBEDDED_ENTITY_TYPE, itemUpdates);

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

    await newActor.updateEmbeddedEntity(EMBEDDED_ENTITY_TYPE, itemUpdates);
}
