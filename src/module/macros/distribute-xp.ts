import Settings from '../settings-app/Settings';

export default async function distributeXp(amount?: number) {
    const selected = canvas.tokens.controlled;

    const distribute = async (amount: number) => {
        for (const token of selected) {
            const actor = token.actor;

            const details = actor.data.data.details;
            if (details === undefined) {
                continue;
            }

            const { xp } = details;
            if (xp === undefined) {
                continue;
            }

            await actor.update({
                ['data.details.xp.value']: xp.value + amount,
            });
        }
    };

    if (amount === undefined) {
        let content = `<div style="display: flex; line-height: 2rem;">
        <label style="flex-grow: 1; padding-right: 8px;" for="dialogAmount">Amount</label>
        <input type="number" style="height: 2rem;" id="dialogAmount">
        </div>`;

        let d = new Dialog({
            title: `Distribute XP`,
            content,
            buttons: {
                distribute: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Distribute',
                    callback: async (html: JQuery) => {
                        const input = html.find('#dialogAmount');
                        const amount = input.val() as string;
                        await distribute(parseInt(amount));
                    },
                },
            },
            default: 'distribute',
        });
        d.render(true);
    } else {
        await distribute(amount);
    }
}
