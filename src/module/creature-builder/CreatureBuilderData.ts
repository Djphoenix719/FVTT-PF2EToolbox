export enum ValueCategory {
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
    defaultValue: ValueCategory;
}

export class CreatureValueCategory {
    name: string;
    descriptor: string;
    availableValues: ValueCategory[];
    associatedValues: CreatureValueEntry[];
}

/* export class RoadmapDefaultValue {
    category: name
}

export class Roadmap {
    defaultValues
} */

export const DefaultCreatureValues: CreatureValueCategory[] = [
    {
        name: 'Abilities',
        descriptor: 'abilityScore',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        associatedValues: [
            {
                name: AdjustableStatistics.str,
                actorField: 'data.abilities.str.mod',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.dex,
                actorField: 'data.abilities.dex.mod',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.con,
                actorField: 'data.abilities.con.mod',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.int,
                actorField: 'data.abilities.int.mod',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.wis,
                actorField: 'data.abilities.wis.mod',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.cha,
                actorField: 'data.abilities.cha.mod',
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.per,
        descriptor: 'perception',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
        associatedValues: [
            {
                actorField: 'data.attributes.perception.value',
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.ac,
        descriptor: 'armorClass',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low],
        associatedValues: [
            {
                actorField: 'data.attributes.ac.value',
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: AdjustableStatistics.hp,
        descriptor: 'hitPoints',
        availableValues: [ValueCategory.high, ValueCategory.moderate, ValueCategory.low],
        associatedValues: [
            {
                actorField: 'data.attributes.hp.value,data.attributes.hp.max',
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: 'Saving Throws',
        descriptor: 'savingThrow',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
        associatedValues: [
            {
                name: AdjustableStatistics.fort,
                actorField: 'data.saves.fortitude.value',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.ref,
                actorField: 'data.saves.reflex.value',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.wil,
                actorField: 'data.saves.will.value',
                defaultValue: ValueCategory.moderate
            }]
    },
    {
        name: 'Skills',
        descriptor: 'skill',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.none],
        associatedValues: [
            {
                name: AdjustableStatistics.acrobatics,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.arcana,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.athletics,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.crafting,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.crafting,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.diplomacy,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.intimidation,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.medicine,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.medicine,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.occultism,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.performance,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.religion,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.society,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.stealth,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.survival,
                actorField: 'none',
                defaultValue: ValueCategory.none
            },
            {
                name: AdjustableStatistics.thievery,
                actorField: 'none',
                defaultValue: ValueCategory.none
            }]
    },
    {
        name: 'Strike',
        descriptor: 'strike',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low],
        associatedValues: [
            {
                name: AdjustableStatistics.strikeBonus,
                actorField: 'none',
                descriptor: 'strikeAttack',
                defaultValue: ValueCategory.moderate
            },
            {
                name: AdjustableStatistics.strikeDamage,
                actorField: 'none',
                descriptor: 'strikeDamage',
                defaultValue: ValueCategory.moderate
            }]
    }
]