import Settings from './Settings';

export function GetRollMode(): string {
    return game.settings.get('core', 'rollMode');
}

export function GetPlayerActors(): Actor[] {
    const folderName = Settings.get(Settings.KEY_PARTY_FOLDER);
    return game.actors.filter((a: Actor) => a.folder && a.folder.name === folderName);
}
