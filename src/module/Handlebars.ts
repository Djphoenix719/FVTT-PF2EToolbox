import { MODULE_NAME } from './Constants';

export async function registerHandlebarsTemplates() {
    // prettier-ignore
    const templatePaths = [
        `modules/${MODULE_NAME}/templates/roll-app/index.html`,
        `modules/${MODULE_NAME}/templates/roll-app/cell.html`,
        `modules/${MODULE_NAME}/templates/roll-app/table.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootApp.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootAppSidebar.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootAppTreasure.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootAppConsumables.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootAppMagicItems.html`,
        `modules/${MODULE_NAME}/templates/loot-app/LootAppScrolls.html`,

        `modules/${MODULE_NAME}/templates/loot-app/create/CreateTab.html`,
        `modules/${MODULE_NAME}/templates/loot-app/create/CreateShared.html`,
        `modules/${MODULE_NAME}/templates/loot-app/create/CreateArmor.html`,
        `modules/${MODULE_NAME}/templates/loot-app/create/CreateWeapon.html`,
        `modules/${MODULE_NAME}/templates/loot-app/create/SelectRow.html`,
        `modules/${MODULE_NAME}/templates/loot-app/create/RuneStats.html`,
    ];
    await loadTemplates(templatePaths);

    Handlebars.registerPartial('rollAppTable', `{{> "modules/${MODULE_NAME}/templates/roll-app/table.html"}}`);
    Handlebars.registerPartial('rollAppCell', `{{> "modules/${MODULE_NAME}/templates/roll-app/cell.html"}}`);
}

export function registerHandlebarsHelpers() {
    Handlebars.registerHelper('includes', function (array: any[], value: any, options: any) {
        if (array.includes(value)) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    Handlebars.registerHelper('ifeq', function (v1, v2, options) {
        if (v1 === v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2) return options.fn(this);
        else return options.inverse(this);
    });
    Handlebars.registerHelper('iflt', function (v1, v2, options) {
        if (v1 < v2) return options.fn(this);
        else return options.inverse(this);
    });

    Handlebars.registerHelper('isNaN', function (context, options) {
        if (isNaN(context) && !(typeof context === 'string')) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper('undefined', function () {
        return undefined;
    });

    Handlebars.registerHelper('hasKey', function (context, key) {
        for (const prop of context) {
            if (prop.hasOwnProperty(key)) {
                return true;
            }
        }
        return false;
    });
}
