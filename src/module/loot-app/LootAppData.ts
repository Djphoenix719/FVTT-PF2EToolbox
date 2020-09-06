export enum CreateMode {
    Weapon = 'weapon',
    Armor = 'armor',
    // Scroll = 'scroll'
}
export const CREATE_MODES = [CreateMode.Weapon, CreateMode.Armor];

export interface IMaterialMap {
    [key: string]: IMaterial;
}
export interface IMaterial {
    id: string;
    label: string;
    defaultGrade: 'low' | 'standard' | 'high';
    low?: IGradeStats;
    standard?: IGradeStats;
    high?: IGradeStats;
}
export interface IThicknessStats {
    hardness: number;
    hp: number;
    bt: number;
}
export interface IGradeStats {
    pricePerBulk: number;
    thinItems?: IThicknessStats;
    items: IThicknessStats;
    structure?: IThicknessStats;
}

export const ITEM_MATERIALS: IMaterialMap = {
    cloth: {
        id: 'cloth',
        label: 'Cloth',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 0,
            thinItems: { hardness: 0, hp: 1, bt: 0 },
            items: { hardness: 1, hp: 4, bt: 2 },
        },
    },
    leather: {
        id: 'leather',
        label: 'Leather',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 0,
            items: { hardness: 4, hp: 16, bt: 8 },
        },
    },
    metal: {
        id: 'metal',
        label: 'Metal',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 0,
            items: { hardness: 9, hp: 36, bt: 18 },
        },
    },
    wood: {
        id: 'wood',
        label: 'Wood',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 0,
            items: { hardness: 5, hp: 20, bt: 10 },
        },
    },
    adamantine: {
        id: 'adamantine',
        label: 'Adamantine',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 350,
            thinItems: { hardness: 10, hp: 40, bt: 20 },
            items: { hardness: 14, hp: 56, bt: 28 },
            structure: { hardness: 28, hp: 112, bt: 56 },
        },
        high: {
            pricePerBulk: 6000,
            thinItems: { hardness: 13, hp: 52, bt: 26 },
            items: { hardness: 17, hp: 68, bt: 34 },
            structure: { hardness: 34, hp: 136, bt: 68 },
        },
    },
    coldIron: {
        id: 'coldIron',
        label: 'Cold Iron',
        defaultGrade: 'standard',
        low: {
            pricePerBulk: 20,
            thinItems: { hardness: 5, hp: 20, bt: 10 },
            items: { hardness: 9, hp: 36, bt: 18 },
            structure: { hardness: 18, hp: 72, bt: 36 },
        },
        standard: {
            pricePerBulk: 250,
            thinItems: { hardness: 7, hp: 28, bt: 14 },
            items: { hardness: 11, hp: 44, bt: 22 },
            structure: { hardness: 22, hp: 88, bt: 44 },
        },
        high: {
            pricePerBulk: 4500,
            thinItems: { hardness: 10, hp: 40, bt: 20 },
            items: { hardness: 14, hp: 56, bt: 28 },
            structure: { hardness: 28, hp: 112, bt: 56 },
        },
    },
    darkwood: {
        id: 'darkwood',
        label: 'Darkwood',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 350,
            thinItems: { hardness: 5, hp: 20, bt: 10 },
            items: { hardness: 7, hp: 28, bt: 14 },
            structure: { hardness: 14, hp: 56, bt: 28 },
        },
        high: {
            pricePerBulk: 6000,
            thinItems: { hardness: 8, hp: 32, bt: 16 },
            items: { hardness: 10, hp: 40, bt: 20 },
            structure: { hardness: 20, hp: 80, bt: 40 },
        },
    },
    dragonhide: {
        id: 'dragonhide',
        label: 'Dragonhide',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 350,
            thinItems: { hardness: 4, hp: 16, bt: 8 },
            items: { hardness: 7, hp: 28, bt: 14 },
        },
        high: {
            pricePerBulk: 6000,
            thinItems: { hardness: 8, hp: 32, bt: 16 },
            items: { hardness: 11, hp: 44, bt: 22 },
        },
    },
    mithral: {
        id: 'mithral',
        label: 'Mithral',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 350,
            thinItems: { hardness: 5, hp: 20, bt: 10 },
            items: { hardness: 9, hp: 36, bt: 18 },
            structure: { hardness: 18, hp: 72, bt: 36 },
        },
        high: {
            pricePerBulk: 6000,
            thinItems: { hardness: 8, hp: 32, bt: 16 },
            items: { hardness: 12, hp: 48, bt: 24 },
            structure: { hardness: 24, hp: 96, bt: 48 },
        },
    },
    orichalcum: {
        id: 'orichalcum',
        label: 'Orichalcum',
        defaultGrade: 'high',
        high: {
            pricePerBulk: 10000,
            thinItems: { hardness: 16, hp: 64, bt: 32 },
            items: { hardness: 18, hp: 72, bt: 36 },
            structure: { hardness: 35, hp: 140, bt: 70 },
        },
    },
    silver: {
        id: 'silver',
        label: 'Silver',
        defaultGrade: 'standard',
        low: {
            pricePerBulk: 20,
            thinItems: { hardness: 3, hp: 12, bt: 6 },
            items: { hardness: 5, hp: 20, bt: 10 },
            structure: { hardness: 10, hp: 40, bt: 20 },
        },
        standard: {
            pricePerBulk: 250,
            thinItems: { hardness: 5, hp: 20, bt: 10 },
            items: { hardness: 7, hp: 28, bt: 14 },
            structure: { hardness: 14, hp: 56, bt: 28 },
        },
        high: {
            pricePerBulk: 4500,
            thinItems: { hardness: 8, hp: 32, bt: 16 },
            items: { hardness: 10, hp: 40, bt: 20 },
            structure: { hardness: 20, hp: 80, bt: 40 },
        },
    },
    sovereignSteel: {
        //TODO: PF2E has id of 'sovereign steel'
        id: 'sovereignSteel',
        label: 'Sovereign Steel',
        defaultGrade: 'standard',
        standard: {
            pricePerBulk: 500,
            thinItems: { hardness: 7, hp: 28, bt: 14 },
            items: { hardness: 11, hp: 44, bt: 22 },
            structure: { hardness: 22, hp: 88, bt: 44 },
        },
        high: {
            pricePerBulk: 8000,
            thinItems: { hardness: 10, hp: 40, bt: 20 },
            items: { hardness: 14, hp: 56, bt: 28 },
            structure: { hardness: 28, hp: 112, bt: 56 },
        },
    },
};

export interface IGrade {
    id: string;
    label: string;
}
export interface IGradesMap {
    [key: string]: IGrade;
}
export const ITEM_GRADES: IGradesMap = {
    low: {
        id: 'low',
        label: 'Low-grade',
    },
    standard: {
        id: 'standard',
        label: 'Standard-grade',
    },
    high: {
        id: 'high',
        label: 'High-grade',
    },
};

export const CREATE_KEY_NONE = '';
const CREATE_OBJECT_NONE = {
    id: CREATE_KEY_NONE,
    nId: 0,
    label: 'None',
    price: 0,
    level: 0,
};
export const ITEM_RUNES = {
    [CreateMode.Weapon]: {
        potency: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            '1': {
                id: '1',
                nId: 1,
                label: 'Weapon Potency (+1)',
                level: 2,
                price: 35,
            },
            '2': {
                id: '2',
                nId: 2,
                label: 'Weapon Potency (+2)',
                level: 10,
                price: 935,
            },
            '3': {
                id: '3',
                nId: 3,
                label: 'Weapon Potency (+3)',
                level: 16,
                price: 8935,
            },
            '4': {
                id: '4',
                nId: 4,
                label: 'Weapon Potency (+4)',
                level: 16,
                price: 8935,
            },
        },
        striking: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            striking: {
                id: 'striking',
                label: 'Striking',
                price: 65,
                level: 4,
            },
            greaterStriking: {
                id: 'greaterStriking',
                label: 'Striking (Greater)',
                price: 1065,
                level: 12,
            },
            majorStriking: {
                id: 'majorStriking',
                label: 'Striking (Major)',
                price: 31065,
                level: 19,
            },
        },
        property: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            anarchic: {
                id: 'anarchic',
                label: 'Anarchic',
                price: 1400,
                level: 11,
            },
            ancestralEchoing: {
                id: 'ancestralEchoing',
                label: 'Ancestral Echoing',
                price: 9500,
                level: 15,
            },
            axiomatic: {
                id: 'axiomatic',
                label: 'Axiomatic',
                price: 1400,
                level: 11,
            },
            bloodbane: {
                id: 'bloodbane',
                label: 'Bloodbane',
                price: 475,
                level: 8,
            },
            corrosive: {
                id: 'corrosive',
                label: 'Corrosive',
                price: 500,
                level: 8,
            },
            dancing: {
                id: 'dancing',
                label: 'Dancing',
                price: 2700,
                level: 13,
            },
            disrupting: {
                id: 'disrupting',
                label: 'Disrupting',
                price: 150,
                level: 5,
            },
            fearsome: {
                id: 'fearsome',
                label: 'Fearsome',
                price: 160,
                level: 5,
            },
            flaming: {
                id: 'flaming',
                label: 'Flaming',
                price: 500,
                level: 8,
            },
            frost: {
                id: 'frost',
                label: 'Frost',
                price: 500,
                level: 8,
            },
            ghostTouch: {
                id: 'ghostTouch',
                label: 'Ghost Touch',
                price: 75,
                level: 4,
            },
            greaterBloodbane: {
                id: 'greaterBloodbane',
                label: 'Bloodbane (Greater)',
                price: 6500,
                level: 15,
            },
            greaterCorrosive: {
                id: 'greaterCorrosive',
                label: 'Corrosive (Greater)',
                price: 6500,
                level: 15,
            },
            greaterDisrupting: {
                id: 'greaterDisrupting',
                label: 'Disrupting (Greater)',
                price: 4300,
                level: 14,
            },
            greaterFearsome: {
                id: 'greaterFearsome',
                label: 'Fearsome (Greater)',
                price: 2000,
                level: 12,
            },
            greaterFlaming: {
                id: 'greaterFlaming',
                label: 'Flaming (Greater)',
                price: 6500,
                level: 15,
            },
            greaterFrost: {
                id: 'greaterFrost',
                label: 'Frost (Greater)',
                price: 6500,
                level: 15,
            },
            greaterShock: {
                id: 'greaterShock',
                label: 'Shock (Greater)',
                price: 6500,
                level: 15,
            },
            greaterThundering: {
                id: 'greaterThundering',
                label: 'Thundering (Greater)',
                price: 6500,
                level: 15,
            },
            grievous: {
                id: 'grievous',
                label: 'Grievous',
                price: 700,
                level: 9,
            },
            holy: {
                id: 'holy',
                label: 'Holy',
                price: 1400,
                level: 11,
            },
            keen: {
                id: 'keen',
                label: 'Keen',
                price: 3000,
                level: 13,
            },
            kinWarding: {
                id: 'kinWarding',
                label: 'Kin-Warding',
                price: 52,
                level: 3,
            },
            pacifying: {
                id: 'pacifying',
                label: 'Pacifying',
                price: 150,
                level: 5,
            },
            returning: {
                id: 'returning',
                label: 'Returning',
                price: 55,
                level: 3,
            },
            serrating: {
                id: 'serrating',
                label: 'Serrating',
                price: 1000,
                level: 10,
            },
            shifting: {
                id: 'shifting',
                label: 'Shifting',
                price: 225,
                level: 6,
            },
            shock: {
                id: 'shock',
                label: 'Shock',
                price: 500,
                level: 8,
            },
            speed: {
                id: 'speed',
                label: 'Speed',
                price: 10000,
                level: 16,
            },
            spellStoring: {
                id: 'spellStoring',
                label: 'Spell-Storing',
                price: 2700,
                level: 13,
            },
            thundering: {
                id: 'thundering',
                label: 'Thundering',
                price: 500,
                level: 8,
            },
            unholy: {
                id: 'unholy',
                label: 'Unholy',
                price: 1400,
                level: 11,
            },
            vorpal: {
                id: 'vorpal',
                label: 'Vorpal',
                price: 15000,
                level: 17,
            },
            wounding: {
                id: 'wounding',
                label: 'Wounding',
                price: 340,
                level: 7,
            },
        },
    },
    [CreateMode.Armor]: {
        potency: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            '1': {
                id: '1',
                nId: 1,
                label: 'Armor Potency (+1)',
                level: 5,
                price: 160,
            },
            '2': {
                id: '2',
                nId: 2,
                label: 'Armor Potency (+2)',
                level: 11,
                price: 1060,
            },
            '3': {
                id: '3',
                nId: 3,
                label: 'Armor Potency (+3)',
                level: 18,
                price: 20560,
            },
            '4': {
                id: '4',
                nId: 4,
                label: 'Armor Potency (+4)',
                level: 18,
                price: 20560,
            },
        },
        resiliency: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            resilient: {
                id: 'resilient',
                label: 'Resilient',
                level: 8,
                price: 340,
            },
            greaterResilient: {
                id: 'greaterResilient',
                label: 'Resilient (Greater)',
                level: 14,
                price: 3440,
            },
            majorResilient: {
                id: 'majorResilient',
                label: 'Resilient (Major)',
                level: 20,
                price: 49440,
            },
        },
        property: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            acidResistant: {
                id: 'acidResistant',
                label: 'Acid-Resistant',
                price: 420,
                level: 8,
            },
            antimagic: {
                id: 'antimagic',
                label: 'Antimagic',
                price: 6500,
                level: 15,
            },
            coldResistant: {
                id: 'coldResistant',
                label: 'Cold-Resistant',
                price: 420,
                level: 8,
            },
            electricityResistant: {
                id: 'electricityResistant',
                label: 'Electricity-Resistant',
                price: 420,
                level: 8,
            },
            ethereal: {
                id: 'ethereal',
                label: 'Ethereal',
                price: 13500,
                level: 17,
            },
            fireResistant: {
                id: 'fireResistant',
                label: 'Fire-Resistant',
                price: 420,
                level: 8,
            },
            fortification: {
                id: 'fortification',
                label: 'Fortification',
                price: 2000,
                level: 12,
            },
            glamered: {
                id: 'glamered',
                label: 'Glamered',
                price: 140,
                level: 5,
            },
            greaterAcidResistant: {
                id: 'greaterAcidResistant',
                label: 'Acid-Resistant (Greater)',
                price: 1650,
                level: 12,
            },
            greaterColdResistant: {
                id: 'greaterColdResistant',
                label: 'Cold-Resistant (Greater)',
                price: 1650,
                level: 12,
            },
            greaterElectricityResistant: {
                id: 'greaterElectricityResistant',
                label: 'Electricity-Resistant (Greater)',
                price: 1650,
                level: 12,
            },
            greaterFireResistant: {
                id: 'greaterFireResistant',
                label: 'Fire-Resistant (Greater)',
                price: 1650,
                level: 12,
            },
            greaterFortification: {
                id: 'greaterFortification',
                label: 'Fortification (Greater)',
                price: 24000,
                level: 18,
            },
            greaterInvisibility: {
                id: 'greaterInvisibility',
                label: 'Invisibility (Greater)',
                price: 1000,
                level: 10,
            },
            greaterReady: {
                id: 'greaterReady',
                label: 'Ready (Greater)',
                price: 1200,
                level: 11,
            },
            greaterShadow: {
                id: 'greaterShadow',
                label: 'Shadow (Greater)',
                price: 650,
                level: 9,
            },
            greaterSlick: {
                id: 'greaterSlick',
                label: 'Slick (Greater)',
                price: 450,
                level: 8,
            },
            greaterWinged: {
                id: 'greaterWinged',
                label: 'Winged (Greater)',
                price: 35000,
                level: 19,
            },
            invisibility: {
                id: 'invisibility',
                label: 'Invisibility',
                price: 500,
                level: 8,
            },
            majorShadow: {
                id: 'majorShadow',
                label: 'Shadow (Major)',
                price: 14000,
                level: 17,
            },
            majorSlick: {
                id: 'majorSlick',
                label: 'Slick (Major)',
                price: 9000,
                level: 16,
            },
            ready: {
                id: 'ready',
                label: 'Ready',
                price: 200,
                level: 6,
            },
            rockBraced: {
                id: 'rockBraced',
                label: 'Rock-Braced',
                price: 3000,
                level: 13,
            },
            shadow: {
                id: 'shadow',
                label: 'Shadow',
                price: 55,
                level: 3,
            },
            sinisterKnight: {
                id: 'sinisterKnight',
                label: 'Sinister Knight',
                price: 500,
                level: 8,
            },
            slick: {
                id: 'slick',
                label: 'Slick',
                price: 45,
                level: 3,
            },
            winged: {
                id: 'winged',
                label: 'Winged',
                price: 2500,
                level: 13,
            },
        },
    },
};
export type ITEM_RUNES = typeof ITEM_RUNES;

// const data =
//     'adamantine,standardGrade,thinItems,10,40,20\n' +
//     'adamantine,highGrade,thinItems,13,52,26\n' +
//     'adamantine,standardGrade,items,14,56,28\n' +
//     'adamantine,highGrade,items,17,68,34\n' +
//     'adamantine,standardGrade,structure,28,112,56\n' +
//     'adamantine,highGrade,structure,34,136,68\n' +
//     'coldIron,lowGrade,thinItems,5,20,10\n' +
//     'coldIron,standardGrade,thinItems,7,28,14\n' +
//     'coldIron,highGrade,thinItems,10,40,20\n' +
//     'coldIron,lowGrade,items,9,36,18\n' +
//     'coldIron,standardGrade,items,11,44,22\n' +
//     'coldIron,highGrade,items,14,56,28\n' +
//     'coldIron,lowGrade,structure,18,72,36\n' +
//     'coldIron,standardGrade,structure,22,88,44\n' +
//     'coldIron,highGrade,structure,28,112,56\n' +
//     'darkwood,standardGrade,thinItems,5,20,10\n' +
//     'darkwood,highGrade,thinItems,8,32,16\n' +
//     'darkwood,standardGrade,items,7,28,14\n' +
//     'darkwood,highGrade,items,10,40,20\n' +
//     'darkwood,standardGrade,structure,14,56,28\n' +
//     'darkwood,highGrade,structure,20,80,40\n' +
//     'dragonhide,standardGrade,thinItems,4,16,8\n' +
//     'dragonhide,highGrade,thinItems,8,32,16\n' +
//     'dragonhide,standardGrade,items,7,28,14\n' +
//     'dragonhide,highGrade,items,11,44,22\n' +
//     'mithral,standardGrade,thinItems,5,20,10\n' +
//     'mithral,highGrade,thinItems,8,32,16\n' +
//     'mithral,standardGrade,items,9,36,18\n' +
//     'mithral,highGrade,items,12,48,24\n' +
//     'mithral,standardGrade,structure,18,72,36\n' +
//     'mithral,highGrade,structure,24,96,48\n' +
//     'orichalcum,highGrade,thinItems,16,64,32\n' +
//     'orichalcum,highGrade,items,18,72,36\n' +
//     'orichalcum,highGrade,structure,35,140,70\n' +
//     'silver,lowGrade,thinItems,3,12,6\n' +
//     'silver,standardGrade,thinItems,5,20,10\n' +
//     'silver,highGrade,thinItems,8,32,16\n' +
//     'silver,lowGrade,items,5,20,10\n' +
//     'silver,standardGrade,items,7,28,14\n' +
//     'silver,highGrade,items,10,40,20\n' +
//     'silver,lowGrade,structure,10,40,20\n' +
//     'silver,standardGrade,structure,14,56,28\n' +
//     'silver,highGrade,structure,20,80,40\n' +
//     'sovereignSteel,standardGrade,thinItems,7,28,14\n' +
//     'sovereignSteel,highGrade,thinItems,10,40,20\n' +
//     'sovereignSteel,standardGrade,items,11,44,22\n' +
//     'sovereignSteel,highGrade,items,14,56,28\n' +
//     'sovereignSteel,standardGrade,structures,22,88,44\n' +
//     'sovereignSteel,highGrade,structures,28,112,56\n' +
//     'cloth,standardGrade,thinItems,0,1,0\n' +
//     'cloth,standardGrade,items,1,4,2\n' +
//     'rope,standardGrade,thinItems,2,8,4\n' +
//     'rope,standardGrade,items,4,16,8\n' +
//     'paper,standardGrade,items,0,1,0\n' +
//     'glass,standardGrade,thinItems,0,1,0\n' +
//     'glass,standardGrade,items,1,4,2\n' +
//     'glass,standardGrade,structures,2,8,4\n' +
//     'leather,standardGrade,thinItems,2,8,4\n' +
//     'leather,standardGrade,items,4,16,8\n' +
//     'ironSteel,standardGrade,thinItems,5,20,10\n' +
//     'ironSteel,standardGrade,items,9,36,18\n' +
//     'ironSteel,standardGrade,structures,18,72,36\n' +
//     'wood,standardGrade,thinItems,3,12,6\n' +
//     'wood,standardGrade,items,5,20,10\n' +
//     'wood,standardGrade,structures,10,40,20\n' +
//     'stone,standardGrade,thinItems,5,16,8\n' +
//     'stone,standardGrade,items,7,28,14\n' +
//     'stone,standardGrade,structures,14,56,28';
//
// window['DATA'] = {};
// const lines = data.split('\n');
// for (const line of lines) {
//     const row = line.split(',');
//     const baseKey = `${row[0]}.${row[1]}.${row[2]}`;
//     window['DATA'][`${baseKey}.hardness`] = parseInt(row[3]);
//     window['DATA'][`${baseKey}.hp`] = parseInt(row[4]);
//     window['DATA'][`${baseKey}.bt`] = parseInt(row[5]);
// }
