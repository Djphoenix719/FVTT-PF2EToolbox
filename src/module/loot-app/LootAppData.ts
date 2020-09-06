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
                level: 25,
                price: 0,
            },
        },
        fundamental: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            striking: {
                nId: 1,
                id: 'striking',
                label: 'striking',
                price: 65,
                level: 4,
            },
            greaterStriking: {
                nId: 2,
                id: 'greaterStriking',
                label: 'greater striking',
                price: 1065,
                level: 12,
            },
            majorStriking: {
                nId: 3,
                id: 'majorStriking',
                label: 'major striking',
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
                label: 'anarchic',
                price: 1400,
                level: 11,
            },
            ancestralEchoing: {
                id: 'ancestralEchoing',
                label: 'ancestral echoing',
                price: 9500,
                level: 15,
            },
            axiomatic: {
                id: 'axiomatic',
                label: 'axiomatic',
                price: 1400,
                level: 11,
            },
            bloodbane: {
                id: 'bloodbane',
                label: 'bloodbane',
                price: 475,
                level: 8,
            },
            corrosive: {
                id: 'corrosive',
                label: 'corrosive',
                price: 500,
                level: 8,
            },
            dancing: {
                id: 'dancing',
                label: 'dancing',
                price: 2700,
                level: 13,
            },
            disrupting: {
                id: 'disrupting',
                label: 'disrupting',
                price: 150,
                level: 5,
            },
            fearsome: {
                id: 'fearsome',
                label: 'fearsome',
                price: 160,
                level: 5,
            },
            flaming: {
                id: 'flaming',
                label: 'flaming',
                price: 500,
                level: 8,
            },
            frost: {
                id: 'frost',
                label: 'frost',
                price: 500,
                level: 8,
            },
            ghostTouch: {
                id: 'ghostTouch',
                label: 'ghost touch',
                price: 75,
                level: 4,
            },
            greaterBloodbane: {
                id: 'greaterBloodbane',
                label: 'greater bloodbane',
                price: 6500,
                level: 15,
            },
            greaterCorrosive: {
                id: 'greaterCorrosive',
                label: 'greater corrosive',
                price: 6500,
                level: 15,
            },
            greaterDisrupting: {
                id: 'greaterDisrupting',
                label: 'greater disrupting',
                price: 4300,
                level: 14,
            },
            greaterFearsome: {
                id: 'greaterFearsome',
                label: 'greater fearsome',
                price: 2000,
                level: 12,
            },
            greaterFlaming: {
                id: 'greaterFlaming',
                label: 'greater flaming',
                price: 6500,
                level: 15,
            },
            greaterFrost: {
                id: 'greaterFrost',
                label: 'greater frost',
                price: 6500,
                level: 15,
            },
            greaterShock: {
                id: 'greaterShock',
                label: 'greater shock',
                price: 6500,
                level: 15,
            },
            greaterThundering: {
                id: 'greaterThundering',
                label: 'greater thundering',
                price: 6500,
                level: 15,
            },
            grievous: {
                id: 'grievous',
                label: 'grievous',
                price: 700,
                level: 9,
            },
            holy: {
                id: 'holy',
                label: 'holy',
                price: 1400,
                level: 11,
            },
            keen: {
                id: 'keen',
                label: 'keen',
                price: 3000,
                level: 13,
            },
            kinWarding: {
                id: 'kinWarding',
                label: 'kin-warding',
                price: 52,
                level: 3,
            },
            pacifying: {
                id: 'pacifying',
                label: 'pacifying',
                price: 150,
                level: 5,
            },
            returning: {
                id: 'returning',
                label: 'returning',
                price: 55,
                level: 3,
            },
            serrating: {
                id: 'serrating',
                label: 'serrating',
                price: 1000,
                level: 10,
            },
            shifting: {
                id: 'shifting',
                label: 'shifting',
                price: 225,
                level: 6,
            },
            shock: {
                id: 'shock',
                label: 'shock',
                price: 500,
                level: 8,
            },
            speed: {
                id: 'speed',
                label: 'speed',
                price: 10000,
                level: 16,
            },
            spellStoring: {
                id: 'spellStoring',
                label: 'spell-storing',
                price: 2700,
                level: 13,
            },
            thundering: {
                id: 'thundering',
                label: 'thundering',
                price: 500,
                level: 8,
            },
            unholy: {
                id: 'unholy',
                label: 'unholy',
                price: 1400,
                level: 11,
            },
            vorpal: {
                id: 'vorpal',
                label: 'vorpal',
                price: 15000,
                level: 17,
            },
            wounding: {
                id: 'wounding',
                label: 'wounding',
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
                level: 25,
                price: 0,
            },
        },
        fundamental: {
            [CREATE_KEY_NONE]: {
                ...CREATE_OBJECT_NONE,
            },
            resilient: {
                nId: 1,
                id: 'resilient',
                label: 'resilient',
                level: 8,
                price: 340,
            },
            greaterResilient: {
                nId: 2,
                id: 'greaterResilient',
                label: 'greater resilient',
                level: 14,
                price: 3440,
            },
            majorResilient: {
                nId: 3,
                id: 'majorResilient',
                label: 'major resilient',
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
                label: 'acid-resistant',
                price: 420,
                level: 8,
            },
            antimagic: {
                id: 'antimagic',
                label: 'antimagic',
                price: 6500,
                level: 15,
            },
            coldResistant: {
                id: 'coldResistant',
                label: 'cold-resistant',
                price: 420,
                level: 8,
            },
            electricityResistant: {
                id: 'electricityResistant',
                label: 'electricity-resistant',
                price: 420,
                level: 8,
            },
            ethereal: {
                id: 'ethereal',
                label: 'ethereal',
                price: 13500,
                level: 17,
            },
            fireResistant: {
                id: 'fireResistant',
                label: 'fire-resistant',
                price: 420,
                level: 8,
            },
            fortification: {
                id: 'fortification',
                label: 'fortification',
                price: 2000,
                level: 12,
            },
            glamered: {
                id: 'glamered',
                label: 'glamered',
                price: 140,
                level: 5,
            },
            greaterAcidResistant: {
                id: 'greaterAcidResistant',
                label: 'greater acid-resistant',
                price: 1650,
                level: 12,
            },
            greaterColdResistant: {
                id: 'greaterColdResistant',
                label: 'greater cold-resistant',
                price: 1650,
                level: 12,
            },
            greaterElectricityResistant: {
                id: 'greaterElectricityResistant',
                label: 'greater electricity-resistant',
                price: 1650,
                level: 12,
            },
            greaterFireResistant: {
                id: 'greaterFireResistant',
                label: 'greater fire-resistant',
                price: 1650,
                level: 12,
            },
            greaterFortification: {
                id: 'greaterFortification',
                label: 'greater fortification',
                price: 24000,
                level: 18,
            },
            greaterInvisibility: {
                id: 'greaterInvisibility',
                label: 'greater invisibility',
                price: 1000,
                level: 10,
            },
            greaterReady: {
                id: 'greaterReady',
                label: 'greater ready',
                price: 1200,
                level: 11,
            },
            greaterShadow: {
                id: 'greaterShadow',
                label: 'greater shadow',
                price: 650,
                level: 9,
            },
            greaterSlick: {
                id: 'greaterSlick',
                label: 'greater slick',
                price: 450,
                level: 8,
            },
            greaterWinged: {
                id: 'greaterWinged',
                label: 'greater winged',
                price: 35000,
                level: 19,
            },
            invisibility: {
                id: 'invisibility',
                label: 'invisibility',
                price: 500,
                level: 8,
            },
            majorShadow: {
                id: 'majorShadow',
                label: 'major shadow',
                price: 14000,
                level: 17,
            },
            majorSlick: {
                id: 'majorSlick',
                label: 'major slick',
                price: 9000,
                level: 16,
            },
            ready: {
                id: 'ready',
                label: 'ready',
                price: 200,
                level: 6,
            },
            rockBraced: {
                id: 'rockBraced',
                label: 'rock-braced',
                price: 3000,
                level: 13,
            },
            shadow: {
                id: 'shadow',
                label: 'shadow',
                price: 55,
                level: 3,
            },
            sinisterKnight: {
                id: 'sinisterKnight',
                label: 'sinister knight',
                price: 500,
                level: 8,
            },
            slick: {
                id: 'slick',
                label: 'slick',
                price: 45,
                level: 3,
            },
            winged: {
                id: 'winged',
                label: 'winged',
                price: 2500,
                level: 13,
            },
        },
    },
};
export type ITEM_RUNES = typeof ITEM_RUNES;
