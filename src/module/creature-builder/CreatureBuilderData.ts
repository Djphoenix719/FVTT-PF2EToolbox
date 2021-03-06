export enum StatisticScale {
    extreme = 'extreme',
    high = 'high',
    moderate = 'moderate',
    low = 'low',
    terrible = 'terrible',
    abysmal = 'abysmal',
    none = 'none', // Required for values that would allow for a null option
}

export enum AdjustableStatistics {
    str = 'Strength',
    dex = 'Dexterity',
    con = 'Constitution',
    int = 'Intelligence',
    wis = 'Wisdom',
    cha = 'Charisma',
    per = 'Perception',
    ac = 'Armor Class',
    hp = 'Hit Points',
    fort = 'Fortitude',
    ref = 'Reflex',
    wil = 'Will',
    acrobatics = 'Acrobatics',
    arcana = 'Arcana',
    athletics = 'Athletics',
    crafting = 'Crafting',
    deception = 'Deception',
    diplomacy = 'Diplomacy',
    intimidation = 'Intimidation',
    medicine = 'Medicine',
    nature = 'Nature',
    occultism = 'Occultism',
    performance = 'Performance',
    religion = 'Religion',
    society = 'Society',
    stealth = 'Stealth',
    survival = 'Survival',
    thievery = 'Thievery',
    strikeBonus = 'Strike Attack Bonus',
    strikeDamage = 'Strike Damage',
}

export class CreatureValueEntry {
    name?: string; // Overrides values from the parent category
    descriptor?: string; // Overrides values from the parent category
    actorField: string;
    defaultValue: StatisticScale;
}

export class CreatureValueCategory {
    name: string;
    descriptor: string;
    availableValues: StatisticScale[];
    associatedValues: CreatureValueEntry[];
}

export class Roadmap {
    name: string;
    defaultValues: Map<string, StatisticScale>;
}

export const DefaultCreatureValues: CreatureValueCategory[] = [
    {
        name: 'Abilities',
        descriptor: 'abilityScore',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low, StatisticScale.terrible, StatisticScale.abysmal],
        associatedValues: [
            {
                name: AdjustableStatistics.str,
                actorField: 'data.abilities.str.mod',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.dex,
                actorField: 'data.abilities.dex.mod',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.con,
                actorField: 'data.abilities.con.mod',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.int,
                actorField: 'data.abilities.int.mod',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.wis,
                actorField: 'data.abilities.wis.mod',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.cha,
                actorField: 'data.abilities.cha.mod',
                defaultValue: StatisticScale.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.per,
        descriptor: 'perception',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low, StatisticScale.terrible],
        associatedValues: [
            {
                actorField: 'data.attributes.perception.value',
                defaultValue: StatisticScale.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.ac,
        descriptor: 'armorClass',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low],
        associatedValues: [
            {
                actorField: 'data.attributes.ac.value',
                defaultValue: StatisticScale.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.hp,
        descriptor: 'hitPoints',
        availableValues: [StatisticScale.high, StatisticScale.moderate, StatisticScale.low],
        associatedValues: [
            {
                actorField: 'data.attributes.hp.value,data.attributes.hp.max',
                defaultValue: StatisticScale.moderate
            }
        ]
    },
    {
        name: 'Saving Throws',
        descriptor: 'savingThrow',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low, StatisticScale.terrible],
        associatedValues: [
            {
                name: AdjustableStatistics.fort,
                actorField: 'data.saves.fortitude.value',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.ref,
                actorField: 'data.saves.reflex.value',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.wil,
                actorField: 'data.saves.will.value',
                defaultValue: StatisticScale.moderate
            }]
    },
    {
        name: 'Skills',
        descriptor: 'skill',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low, StatisticScale.none],
        associatedValues: [
            {
                name: AdjustableStatistics.acrobatics,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.arcana,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.athletics,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.crafting,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.crafting,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.diplomacy,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.intimidation,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.medicine,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.medicine,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.occultism,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.performance,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.religion,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.society,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.stealth,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.survival,
                actorField: 'none',
                defaultValue: StatisticScale.none
            },
            {
                name: AdjustableStatistics.thievery,
                actorField: 'none',
                defaultValue: StatisticScale.none
            }]
    },
    {
        name: 'Strike',
        descriptor: 'strike',
        availableValues: [StatisticScale.extreme, StatisticScale.high, StatisticScale.moderate, StatisticScale.low],
        associatedValues: [
            {
                name: AdjustableStatistics.strikeBonus,
                actorField: 'none',
                descriptor: 'strikeAttack',
                defaultValue: StatisticScale.moderate
            },
            {
                name: AdjustableStatistics.strikeDamage,
                actorField: 'none',
                descriptor: 'strikeDamage',
                defaultValue: StatisticScale.moderate
            }]
    }
]

export const ROADMAPS: Roadmap[] = [
    {
        name: 'Brute',
        defaultValues: new Map([
                [AdjustableStatistics.per, StatisticScale.low]
        ])
    },
    {
        name: 'Brute2',
        defaultValues: new Map([
            [AdjustableStatistics.per, StatisticScale.high]
        ])
    }
]

