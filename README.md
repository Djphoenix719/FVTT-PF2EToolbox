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



### Small Features
- Hold control or shift to quickly increase/decrease item quantities by configurable amounts
- Quickly view a scene with a new "View Scene" option accessible by right clicking a scene in the sidebar
- Configure the maximum number of hero points a player can have
- Hold alt when you drop an item onto a loot sheet or player sheet to mystify it (requires Forien's Unidentified Items)
- A toggle to HIDE the PFS tab (does not disable things on the tab from functioning if they were already used)

### NPC Scaler
Right clicking an NPC in the sidebar shows a new "Scale to Level" option. You can quickly scale any NPC to any level, up or down.

It's pretty darn accurate, as PF2E has pretty tight math - however, you should validate the NPC yourself. Sometimes creatures deviate from the guidelines presented in the GMG, in these cases it attempts to make a best-guess while keeping the spirit of the monster intact. For example, a creature that is below the specified HP guidelines will still be below the specified HP guidelines at the new level by the same percentage amount.

It does the following
- AC, Saving Throws, HP
- Attack Modifiers, Strike Damage
- DCs contained in ability descriptions
- Damage contained in ability descriptions
- Spell DCs, Spell Attack
- Skill modifiers

All scaled NPCs are placed in a folder according to their level, which is nested in a folder of your choice.

### Quick Roller
A very basic quick roller. Has all the NPC data available in tables with clickable entries. Highlights the row corresponding to the level of the selected token(s).

Right clicking will roll 2x the value, even for the d20 rolls. If you have a token selected the chat card will display its name.

Found in the journals tab. 

### Token Setup
If you name all your token images in the below manner, it can smartly map token names for a specified folder automatically.

Token names should be as follows, and will be checked for in a configurable path of your choice.

> `Creature_Name_No_Spaces_##.png`

Creatures that are NOT set to "Link Actor Data" (meaning they are NOT unique) will use the correct wildcard syntax. Otherwise, they MUST end with `01`.

If a creature has a prefix or suffix such as "Greater Shadow" or "Ghost, Commoner", the name mapper will try to find the full name first, but then chop off words until it can find a token name.

So for example, with the "Greater Shadow" example, it will try to find these token names in order. Commas will be removed from actor names.

1. `Greater_Shadow_01.png`
2. `Shadow_01.png`
3. `Greater_01.png`

For the example "Ghost, Commoner" the name mapper will try

1. `Ghost_Commoner_01.png`
2. `Ghost_01.png`
2. `Commoner_01.png`

### Features to Come
- Loot Roller w/ automation support for Forien's Unidentified Items
