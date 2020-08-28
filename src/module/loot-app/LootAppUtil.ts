
export async function getTables() {
    const pack = game.packs.get('pf2e.rollable-tables') as Compendium;
    const tables = (await pack.getContent()) as RollTable[];
    return { pack, tables };
}

export async function getItemFromCollection(collectionId: string, itemId: string) {
    const pack = game.packs.get(collectionId) as Compendium;
    const entity = await pack.getEntity(itemId);
    console.warn(entity);
    return entity;
}
