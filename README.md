# PF2E Toolbox
![GitHub release (latest by date)](https://img.shields.io/github/v/release/DJPhoenix719/FVTT-PF2EToolbox)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Djphoenix719/FVTT-PF2EToolbox/Release%20Module)
[![GitHub issues](https://img.shields.io/github/issues/Djphoenix719/FVTT-PF2EToolbox)](https://github.com/Djphoenix719/FVTT-PF2EToolbox/issues)
[![GitHub license](https://img.shields.io/github/license/Djphoenix719/FVTT-PF2EToolbox)](https://github.com/Djphoenix719/FVTT-PF2EToolbox/blob/master/LICENSE)

![GitHub All Releases](https://img.shields.io/github/downloads/Djphoenix719/FVTT-PF2EToolbox/total)
![GitHub Releases](https://img.shields.io/github/downloads/Djphoenix719/FVTT-PF2EToolbox/latest/total)

[Please consider supporting me on Ko-Fi](https://ko-fi.com/djsmods)

A selection of enhancements and tools made to help run PF2E games in Foundry VTT.

All features can be enabled or disabled on a feature-by-feature basis in the settings.

### Thanks To
Sir Blackmane#5955 - for creating the original group save macro the one in Toolbox is based on

### Small Features
- Hold control or shift to quickly increase/decrease item quantities by configurable amounts
- Configure the maximum number of hero points a player can have
- Hold alt when you drop an item onto a loot sheet or player sheet to mystify it (requires Forien's Unidentified Items)
- A toggle to HIDE the PFS tab (does not disable things on the tab from functioning if they were already used)
- Flatten NPC feature to using the variant rules from the GMG for *Proficiency without Level*

### Macro Helpers
A growing collection of macro helpers. Examples of their use are included in a compendium.

`game.PF2EToolbox.rollSecretSkill(skill_id)` can roll an always-secret skill check for the selected token, or if none is selected for the user's configured character. If no skill id is passed in it will show a prompt to determine the skill. You can use `game.PF2EToolbox.rollSecretSkill('give me the ids!')` to get a list of skill ids for the selected token.

`game.PF2EToolbox.distributeXp(amount)` can distribute an amount of XP to selected tokens. If no amount is provided, shows a prompt for the amount.

`game.PF2EToolbox.distributeHeroPoints(amount)` can distribute 1+ hero points to selected tokens. If no amount is provided, shows a prompt for the amount.

`game.PF2EToolbox.groupSave()` will roll a saving throw for all selected tokens and optionally display the success level and if you entered the damage, display buttons next to each result for full/half/double damage.

### NPC Scaler
Right clicking an NPC in the sidebar shows a new "Scale to Level" option. You can quickly scale any NPC to any level, up or down.

It's pretty darn accurate, as PF2E has pretty tight math - however, you should validate the NPC yourself. Sometimes creatures deviate from the guidelines presented in the GMG, in these cases it attempts to make a best-guess while keeping the spirit of the monster intact. For example, a creature that is below the specified HP guidelines will still be below the specified HP guidelines at the new level by the same percentage amount.

The only time it begins to "break down" is if you scale a creature multiple times, say from level 1 to 3, then from 3 to 5, and so on.

It does the following
- Armor Class, Saving Throws, Hit Points
- Ability Scores
- Attack Modifiers, Strike Damage
- DCs and Area Damage contained in ability descriptions
- Spell DCs, Spell Attack modifiers
- Skill modifiers
- Weaknesses & Resistances

All scaled NPCs are placed in a folder according to their level, which is nested in a folder of your choice.

### Quick Roller
A very basic quick roller. Has all the NPC data available in tables with clickable entries. Highlights the row corresponding to the level of the selected token(s).

Right clicking will roll 2x the value, even for the d20 rolls. If you have a token selected the chat card will display its name.

Found in the journals tab. 

### Token Setup
If you name all your token images in the below manner, it can smartly map token names for a specified folder automatically. Supported file formats are jpg, jpeg, png, gif, webp and svg - the token setup tool will detect any of these formats, but you must use the same format for all your tokens of a specific creature because of limitations with Foundry.

Token names should be as follows, and will be checked for in a configurable path of your choice.

> `Creature_Name_No_Spaces_##`

Creatures that are NOT set to "Link Actor Data" (meaning they are NOT unique) will use the correct wildcard syntax. Otherwise, they MUST end with `01`.

If a creature has a prefix or suffix such as "Greater Shadow" or "Ghost, Commoner", the name mapper will try to find the full name first, but then chop off words until it can find a token name.

So for example, with the "Greater Shadow" example, it will try to find these token names in order. Commas will be removed from actor names.

1. `Greater_Shadow_01.png`
2. `Shadow_01.png`
3. `Greater_01.png`

For the example "Ghost, Commoner" the name mapper will try

1. `Ghost_Commoner_01.png`
2. `Commoner_01.png`
2. `Ghost_01.png`

### Loot Generator
This is a work in progress, but right now it can quickly roll treasure items (including updating their values correctly), roll consumables, and roll magic items. Works with the quick mystification feature if you want the items to need appraisal (hold alt as usual). It's a separate loot sheet, as noted in the preview image (click on Settings in the header and use the `pf2e-toolbox.LootApp` sheet).

![image](https://github.com/Djphoenix719/FVTT-PF2EToolbox/blob/master/.github/treasure-generator-v1.png?raw=true)

### Features to Come
- Spell Scroll creator

## License

### Project Licensing:
Content Usage and Licensing:

#### Pathfinder Second Edition
This project is fan-made, and is not associated with Paizo Inc. in any way.

PF2E Toolbox uses trademarks and/or copyrights owned by Paizo Inc., used under Paizo's Community Use Policy (paizo.com/communityuse). We are expressly prohibited from charging you to use or access this content. PF2E Toolbox is not published, endorsed, or specifically approved by Paizo. For more information about Paizo Inc. and Paizo products, visit [paizo.com](https://www.paizo.com).

Any Pathfinder Second Edition information used under the Paizo Inc. Community Use Policy (https://paizo.com/community/communityuse)

Game system information and mechanics are licensed under the Open Game License (OPEN GAME LICENSE Version 1.0a).

#### Playtest
Pathfinder Secrets of Magic Class Playtest © 2020, Paizo Inc.; Author: Jason Bulmahn, Logan Bonner, Lyz Liddell and Mark Seifter

#### Virtual Table Top Platform Licenses
Foundry VTT support is covered by the following license: Limited License Agreement for module development 09/02/2020.
