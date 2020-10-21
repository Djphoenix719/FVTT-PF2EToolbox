import Settings from '../settings-app/Settings';

export async function distributeHeroPoints(amount: number) {
    const selected = canvas.tokens.controlled;
    const max: number = Settings.get(Settings.MAX_HERO_POINTS);

    const distribute = async (amount: number) => {
        for (const token of selected) {
            const actor = token.actor;

            const heroPoints = actor.data.data.attributes.heroPoints;
            if (heroPoints === undefined) {
                continue;
            }

            const { rank } = heroPoints;
            if (rank === undefined) {
                continue;
            }

            if (rank === max) {
                continue;
            }

            await actor.update({
                ['data.attributes.heroPoints.rank']: Math.min(rank + amount, max),
            });
        }
    };

    if (amount === undefined) {
        let content = `<div style="display: flex; line-height: 2rem;">
        <label style="flex-grow: 1; padding-right: 8px;" for="dialogAmount">Amount</label>
        <input type="number" style="height: 2rem;" id="dialogAmount">
        </div>`;

        let d = new Dialog({
            title: `Distribute Hero Point(s)`,
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
