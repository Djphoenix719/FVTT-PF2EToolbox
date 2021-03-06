export enum ValueCategory {
    extreme = 'extreme',
    high = 'high',
    moderate = 'moderate',
    low = 'low',
    terrible = 'terrible',
    abysmal = 'abysmal',
    none = 'none', // Required for values that would allow for a null option
}

export class CreatureValueEntry {
    name?: string;
    actorField: string;
    availableValues: ValueCategory[];
    defaultValue: ValueCategory;
}

export class CreatureValueCategory {
    name: string;
    descriptor: string;
    associatedValues: CreatureValueEntry[];
}

export const DefaultCreatureValues: CreatureValueCategory[] = [
    {
        name: 'Abilities',
        descriptor: 'abilityScore',
        associatedValues: [
            {
                name: 'Strength',
                actorField: 'data.abilities.str.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Dexterity',
                actorField: 'data.abilities.dex.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Constitution',
                actorField: 'data.abilities.con.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Intelligence',
                actorField: 'data.abilities.int.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Wisdom',
                actorField: 'data.abilities.wis.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Charisma',
                actorField: 'data.abilities.cha.mod',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: 'Perception',
        descriptor: 'perception',
        associatedValues: [
            {
                actorField: 'data.attributes.perception.value',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: 'Armor Class',
        descriptor: 'armorClass',
        associatedValues: [
            {
                actorField: 'data.attributes.ac.value',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low],
                defaultValue: ValueCategory.moderate
            }
        ]
    },
    {
        name: 'Saving Throws',
        descriptor: 'savingThrow',
        associatedValues: [
            {
                name: 'Fortitude',
                actorField: 'data.saves.fortitude.value',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Reflex',
                actorField: 'data.saves.reflex.value',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
                defaultValue: ValueCategory.moderate
            },
            {
                name: 'Will',
                actorField: 'data.saves.will.value',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
                defaultValue: ValueCategory.moderate
            }]
    },
    {
        name: 'Skills',
        descriptor: 'skill',
        associatedValues: [
            {
                name: 'Acrobatics',
                actorField: 'none',
                availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.none],
                defaultValue: ValueCategory.none
            }
            ]
    }
]