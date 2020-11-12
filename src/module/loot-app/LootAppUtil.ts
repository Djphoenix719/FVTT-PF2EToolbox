export async function GetRollableTables() {
    const pack = game.packs.get('pf2e.rollable-tables') as Compendium;
    const tables = (await pack.getContent()) as RollTable[];
    return { pack, tables };
}

export async function GetItemFromCollection(collectionId: string, itemId: string) {
    const pack = (await game.packs.get(collectionId)) as Compendium;
    return await pack.getEntity(itemId);
}

export async function GetTreasureTables() {
    const { pack, tables } = await GetRollableTables();

    const find = (name: string) => {
        return tables.find((table) => table.name === name);
    };

    const value = (base: number, denomination: 'sp' | 'gp') => {
        return `${base}${denomination}-${4 * base}${denomination}`;
    };

    return [
        {
            table: find('Lesser Semiprecious Stones'),
            value: value(5, 'sp'),
        },
        {
            table: find('Moderate Semiprecious Stones'),
            value: value(25, 'sp'),
        },
        {
            table: find('Greater Semiprecious Stones'),
            value: value(5, 'gp'),
        },
        {
            table: find('Lesser Precious Stones'),
            value: value(50, 'gp'),
        },
        {
            table: find('Moderate Precious Stones'),
            value: value(100, 'gp'),
        },
        {
            table: find('Minor Art Object'),
            value: value(1, 'gp'),
        },
        {
            table: find('Lesser Art Object'),
            value: value(10, 'gp'),
        },
        {
            table: find('Moderate Art Object'),
            value: value(25, 'gp'),
        },
        {
            table: find('Greater Art Object'),
            value: value(250, 'gp'),
        },
        {
            table: find('Major Art Object'),
            value: value(1000, 'gp'),
        },
    ];
}

export async function GetMagicItemTables(searchName: string) {
    let { pack, tables } = await GetRollableTables();
    tables = tables.filter((table) => table.name.includes(searchName));

    const sortRegex = /[0-9]+/;

    tables.sort((a, b) => {
        let an = 0;
        let bn = 0;

        const ar = sortRegex.exec(a.name);
        const br = sortRegex.exec(b.name);

        if (ar !== null) {
            an = parseInt(ar[0]);
        }
        if (br !== null) {
            bn = parseInt(br[0]);
        }

        return an - bn;
    });

    return tables;
}
