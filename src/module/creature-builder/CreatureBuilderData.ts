export enum ValueCategory {
    extreme = 'extreme',
    high = 'high',
    moderate = 'moderate',
    low = 'low',
    terrible = 'terrible',
    abysmal = 'abysmal',
}

export class CreatureValueEntry {
    name: string;
    descriptor: string;
    actorField: string;
    availableValues: ValueCategory[];
    defaultValue: ValueCategory;
}

export const DefaultCreatureValues: CreatureValueEntry[] = [
    {
        name: 'Strength',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.str.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Dexterity',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.dex.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Constitution',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.con.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Intelligence',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.int.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Wisdom',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.wis.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Charisma',
        descriptor: 'abilityScore',
        actorField: 'data.abilities.cha.mod',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible, ValueCategory.abysmal],
        defaultValue: ValueCategory.moderate
    },
    {
        name: 'Perception',
        descriptor: 'perception',
        actorField: 'data.attributes.perception.value',
        availableValues: [ValueCategory.extreme, ValueCategory.high, ValueCategory.moderate, ValueCategory.low, ValueCategory.terrible],
        defaultValue: ValueCategory.moderate
    },
]