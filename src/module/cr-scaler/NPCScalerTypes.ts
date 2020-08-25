export type IDataUpdates = {
    _id: string;
    [key: string]: any;
};

export type IStrikeDamage = {
    average: number;
    bonus: number;
    diceCount: number;
    diceSize: number;
    original: string;
};

export type IHandledItemType = 'lore' | 'spellcastingEntry' | 'melee';
