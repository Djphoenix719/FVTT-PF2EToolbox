import { ROLL_APP_DATA } from '../roll-app/RollAppData';
import Settings from '../Settings';

const DATA = duplicate(ROLL_APP_DATA);

type T_STRIKE_DAMAGE = {
    average: number;
    bonus: number;
    diceCount: number;
    diceSize: number;
    original: string;
};
const STRIKE_DAMAGE: {
    level: number;
    low: T_STRIKE_DAMAGE;
    moderate: T_STRIKE_DAMAGE;
    high: T_STRIKE_DAMAGE;
    extreme: T_STRIKE_DAMAGE;
}[] = [];
const DAMAGE_DATA = {
    strikeDamage: STRIKE_DAMAGE,
};

function parseDamage(value: string): T_STRIKE_DAMAGE {
    let [diceString, bonusString] = value.split('+');
    let bonus: number = 0;
    if (bonusString !== undefined) {
        bonus = parseInt(bonusString);
    }

    let [diceCountString, diceSizeString] = diceString.split('d');
    let result = {
        diceCount: parseInt(diceCountString),
        diceSize: parseInt(diceSizeString),
        original: value,
        average: 0,
        bonus,
    };

    result.average = ((result.diceSize + 1) / 2) * result.diceCount + result.bonus;

    return result;
}

const constructFormula = ({ diceCount, diceSize, bonus }: { diceCount: number; diceSize: number; bonus: number }) => {
    return `${diceCount}d${diceSize}+${bonus}`;
};

for (const entry of Object.values(DATA.strikeDamage)) {
    const parsed = duplicate(entry) as any;
    for (const key of Object.keys(parsed)) {
        if (key === 'level') {
            continue;
        }

        parsed[key] = parseDamage(parsed[key]);
    }
    DAMAGE_DATA.strikeDamage.push(parsed);
}

function getFolder(name: string): Folder | null {
    return game.folders.find((f) => f.name === name);
}
function getActor(name: string, folder: string): Actor | null {
    return game.actors.find((a) => a.name === name && a.folder?.name === folder);
}
const getLeveledData = (key: keyof typeof DATA, oldValue: number, oldLevel: number, newLevel: number) => {
    const data = DATA[key];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];

    let bestMatch: { key: string; delta: number } = { key: 'undefined', delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }

        const value = parseInt(entry[1] as any);
        const delta = Math.abs(value - oldValue);

        if (delta < bestMatch.delta) {
            bestMatch = {
                key,
                delta,
            };
        }
    }

    let result = {
        value: newLevelData[bestMatch.key],
        delta: oldValue - oldLevelData[bestMatch.key],
        total: 0,
    };
    result.total = result.value + result.delta;

    return result;
};
const getHPData = (oldValue: number, oldLevel: number, newLevel: number) => {
    const data = DATA['hitPoints'];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];

    // try to find an exact match
    let bestMatch: { key: string; percentile: number; delta: number } = { key: 'undefined', percentile: 0, delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }

        let entryValue = entry[1] as { die: number; maximum: number; minimum: number };
        const { minimum, maximum } = entryValue;
        const range = maximum - minimum;
        const percentile = (oldValue - minimum) / range;
        const dMin = Math.abs(oldValue - minimum);
        const dMax = Math.abs(oldValue - maximum);
        const delta = Math.min(dMin, dMax);

        if (oldValue > minimum && oldValue < maximum) {
            bestMatch = {
                key,
                percentile,
                delta,
            };
            break;
        } else {
            if (delta < bestMatch.delta) {
                bestMatch = {
                    key,
                    percentile,
                    delta,
                };
            }
        }
    }

    const newValue = newLevelData[bestMatch.key];
    return Math.round(newValue.minimum + (newValue.maximum - newValue.minimum) * bestMatch.percentile);
};

function constructRelativeDamage(oldDmg: T_STRIKE_DAMAGE, stdDmg: T_STRIKE_DAMAGE, newDmg: T_STRIKE_DAMAGE): T_STRIKE_DAMAGE {
    const count = newDmg.diceCount;
    const size = newDmg.diceSize;
    const bonus = newDmg.bonus + oldDmg.bonus - stdDmg.bonus;

    return parseDamage(
        constructFormula({
            diceCount: count,
            diceSize: size,
            bonus,
        }),
    );
}

const DMG_PCT_MAX_DELTA = 0.5;
const getDamageData = (oldValue: string, oldLevel: number, newLevel: number) => {
    const data = DAMAGE_DATA['strikeDamage'];
    const oldLevelData = data[oldLevel + 1];
    const newLevelData = data[newLevel + 1];
    const parsedOldValue = parseDamage(oldValue);

    let bestMatch: { key: string; delta: number } = { key: 'undefined', delta: Number.MAX_SAFE_INTEGER };
    for (const entry of Object.entries(oldLevelData)) {
        const key = entry[0];
        if (key === 'level') {
            continue;
        }

        const value = entry[1] as T_STRIKE_DAMAGE;
        const delta = Math.abs(value.average - parsedOldValue.average);

        if (delta < bestMatch.delta) {
            bestMatch = {
                key,
                delta,
            };
        }
    }

    if (bestMatch.delta < parsedOldValue.average * DMG_PCT_MAX_DELTA) {
        return constructRelativeDamage(parsedOldValue, oldLevelData[bestMatch.key], newLevelData[bestMatch.key]).original;
        // return newLevelData[bestMatch.key].original;
    } else {
        return oldValue;
    }
};

export default async function scale_to_level(actor: Actor, newLevel: number) {
    const root = getFolder(Settings.get(Settings.KEY_SCALED_OUTPUT_FOLDER));

    function getFolderInRoot(name: string) {
        return game.folders.find((f) => f.name === name && f.parent?.name === root?.name);
    }

    const folderName = `Level ${newLevel}`;
    const folder =
        getFolderInRoot(folderName) ??
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
