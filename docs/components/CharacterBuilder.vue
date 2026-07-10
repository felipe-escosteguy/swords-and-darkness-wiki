<script setup>
import { ref, computed, onMounted } from 'vue'
import spellsData from './spells.json'

// --- CORE DATA TABLES ---

const ANCESTRIES = {
  human: { name: 'Human', size: 'Medium', speed: 12, adj: {}, traits: ['Primary class reassignment (once per lifetime)'], requirements: {} },
  huldar: { name: 'Húldar', size: 'Medium', speed: 12, adj: { wis: 1, con: -1 }, traits: ['Enchantment Resistance (90% sleep/charm)', 'Keen Senses (Secret doors 1 on 1d6, 1-2 when active; Concealed 1-3 when active)', 'Stealthy (In natural terrain, -4 surprise to opponents if alone/in Húldar group and not in metal armor)', 'Infravision (18 m)'], requirements: { str: [3, 18], dex: [6, 19], con: [7, 18], int: [5, 18], wis: [10, 18], cha: [3, 18] } },
  aelar: { name: 'Aelár', size: 'Medium', speed: 12, adj: { dex: 1, con: -1 }, traits: ['Enchantment Resistance (30% sleep/charm)', 'Keen Senses (Secret doors 1 on 1d6, 1-2 when active; Concealed 1-3 when active)', 'Infravision (18 m)'], requirements: { str: [3, 18], dex: [6, 19], con: [5, 18], int: [4, 18], wis: [3, 18], cha: [6, 18] } },
  duardeen: { name: 'Duardeen', size: 'Medium', speed: 9, adj: { con: 1, dex: -1 }, traits: ['Magic Resistance (+1 to saves vs. wands/spells/rods per 3.5 CON)', 'Poison Resistance (+1 to poison saves per 3.5 CON)', 'Favored Enemy (+1 attack vs. goblinoids and orcs)', 'Stonecunning (Active search 3m of stone: grade/new passage 1-5 on 1d6; sliding walls 1-4; stone traps 1-3; depth 1-3)', 'Infravision (18 m)'], requirements: { str: [8, 18], dex: [2, 17], con: [11, 19], int: [3, 18], wis: [3, 18], cha: [3, 17] } },
  duergar: { name: 'Duergar', size: 'Medium', speed: 9, adj: { con: 1, cha: -1 }, traits: ['Darkvision (See in complete darkness, cold objects included, no heat limit)', 'Daylight Sensitivity (-2 to attacks/saves/checks in direct daylight)', 'Magic Resistance (+1 to saves vs. wands/spells/rods per 3.5 CON)', 'Stonecunning (As Duardeen)'], requirements: { str: [8, 18], dex: [2, 16], con: [12, 20], int: [3, 18], wis: [3, 18], cha: [2, 14] } },
  badaki: { name: 'Badaki', size: 'Medium', speed: 12, adj: { str: 2, con: 1, dex: -1, int: -1 }, traits: ['Natural Armor (Base AC 7)', 'Gore (Natural attack dealing 1d6 piercing, 2d6 on 6m straight charge)', 'Badaki Season Counter (Age in seasons: starting age * 4)'], requirements: { str: [13, 20], dex: [3, 16], con: [13, 20], int: [3, 17], wis: [3, 18], cha: [3, 16] } }, // Also double 13 in STR & CON before adj
  urgon: { name: 'Ûrgon', size: 'Large', speed: 9, adj: { str: 2, con: 1, dex: -2 }, traits: ['Natural Armor (Base AC 7)', 'Tusk Attack (Natural attack dealing 1d6 piercing)', 'Living Archive (1/day recall history: d20 vs. INT check)', 'Size Penalty (-2 attacks/AC in corridors < 3m; door < 1.5m takes 1 round & STR check)', 'Custom Armor (Cost 3x standard, custom-fit)', 'Infravision (18 m)'], requirements: { str: [13, 20], dex: [2, 14], con: [13, 20], int: [5, 18], wis: [8, 18], cha: [6, 18] } }, // Also double 13 in STR & CON before adj
  vartran: { name: 'Vartran', size: 'Medium', speed: 12, adj: { str: 1, con: 1, dex: -1 }, traits: ['Natural Armor (Base AC 7)', 'Magic Resistance (Saves vs. spells/wands/rods bonus from CON: 1-3 = 0, 4-6 = +1, 7-9 = +2, 10-12 = +3, 13-15 = +4, 16-18 = +5)', 'Breath Weapon (1/day + 1/5 levels, 3m cone, 2d6 damage, save halves; damage 3d6 at lvl 7, 4d6 at lvl 13; choose type at creation)', 'Old Tongue Connection (Prohibited language; critical failure on social/morale checks if used; Church agents hostile)', 'Infravision (18 m)'], requirements: { str: [8, 20], dex: [3, 16], con: [10, 20], int: [6, 18], wis: [3, 18], cha: [3, 18] } },
  valarian: { name: "Val'arian", size: 'Medium', speed: 9, adj: { dex: 1, str: -1 }, traits: ['Low-Light Vision (Normal vision in starlight/moonlight/candlelight)', 'Infravision (9 m)'], requirements: { str: [3, 17], dex: [8, 19], con: [5, 17], int: [5, 18], wis: [6, 18], cha: [6, 18] } }
}

const CLASSES = {
  fighter: { name: 'Fighter', group: 'warrior', prime: ['str'], req: { str: 9 }, hd: 10, weaponArmor: 'All weapons and armor', features: ['Weapon Specialization (Fighters only; +1 attack, +2 damage for 2 SP)', 'Multiple Attacks (Iterative attacks as level increases)', 'Combat Maneuvers (Unrestricted access)'] },
  paladin: { name: 'Paladin', group: 'warrior', prime: ['str', 'cha'], req: { str: 12, wis: 13, cha: 17 }, hd: 10, weaponArmor: 'All weapons and armor', features: ['Lay on Hands (1/day heal 2x level HP)', 'Detect Evil (At will, sense evil within 18m)', 'Divine Aura (Allies within 3m gain +1 to saves)', 'Saving Throw Bonus (+2 to all saves)', 'Turn Undead (As cleric 2 levels lower)', 'Warhorse (Call special mount at level 4)', 'Divine Spellcasting (From level 9, cast priest spells)', 'Wealth Restriction (Cannot retain wealth; max 1 henchman)'], ancestries: ['human', 'badaki', 'urgon'] },
  ranger: { name: 'Ranger', group: 'warrior', prime: ['str', 'wis'], req: { str: 13, dex: 13, con: 14, wis: 14 }, hd: 10, weaponArmor: 'All weapons. Light/no armor for stealth.', features: ['Two-Weapon Fighting (Reduced penalties: -2/-4)', 'Tracking (Wisdom check to follow trails)', 'Favored Enemy (+4 attack and damage vs. chosen category)', 'Wilderness Stealth (-4 opponents surprise rolls in natural terrain)', 'Animal Empathy (Calm/communicate with natural animals)', 'Path Selection (Level 8: Warden (Druid spells) or Scout (Archery, stealth, tracking bonuses))'] },
  champion: { name: 'Champion', group: 'warrior', prime: ['str', 'cha'], req: { str: 12, wis: 13, cha: 17 }, hd: 10, weaponArmor: 'All weapons and armor', features: ['Disciplined Defense (+1 to AC at all times)', 'Weapon Mastery (1 free weapon specialization)', 'Inspiring Presence (Allies within 9m gain +1 to morale/fear saves)', 'Steadfast (Level 7: Immune to fear effects)', 'Champion\'s Reputation (Level 9: +2 reaction with NPCs)'], unavailable: ['valarian', 'huldar'] },
  mage: { name: 'Mage', group: 'wizard', prime: ['int'], req: { int: 9 }, hd: 4, weaponArmor: 'Dagger, staff, dart, sling. No armor.', features: ['Spellbook (Record wizard spells, learn from scrolls)', 'Spell Memorization (Cast memorized spells)', 'Scroll Use (Scribe and use wizard scrolls)', 'High Solaran (Arcane language)', 'Gauntlet (Level 2 Magnus Trials; Apprentice status until passed)'] },
  sorcerer: { name: 'Sorcerer', group: 'wizard', prime: ['wis'], req: { wis: 13, con: 10 }, hd: 4, weaponArmor: 'Dagger, staff, dart, sling. No armor.', features: ['Arcane Attunement (No spellbooks, meditates to learn)', 'Cannot Use Scrolls', 'Arcane Surge (Spend HP to boost spells: Potency = Level*3 HP, Double-cast = Level*5 HP)', 'Patron Bond (Once/session ask patron a question)', 'Patron Demand (Every 3 sessions chance of demand)'], ancestries: ['human', 'vartran', 'huldar', 'aelar'] },
  cleric: { name: 'Cleric', group: 'priest', prime: ['wis'], req: {}, hd: 8, weaponArmor: 'Blunt weapons. All armor.', features: ['Divine Spellcasting (No spellbook; prayers to deity)', 'Turn Undead (Holy symbol presentation)', 'Deity Requirements (Must follow principles or lose spells)', 'Ordination Name'] },
  druid: { name: 'Druid', group: 'priest', prime: ['wis'], req: { wis: 12, cha: 15 }, hd: 8, weaponArmor: 'Club, sickle, dart, spear, dagger, scimitar, staff, sling. Non-metal armor/shields.', features: ['Primal Spellcasting (Nature spells)', 'Identify Plants and Animals (Automatic)', 'Pass Without Trace (No tracks/sound in natural terrain)', 'Immunity to Woodland Charm', 'Shapechange (Level 7: 3/day assume animal form)', 'Hierophantic Rank (Advancement above level 11 requires contest)', 'Druidic Secret Tongue'], ancestries: ['huldar', 'aelar'] },
  thief: { name: 'Thief', group: 'rogue', prime: ['dex'], req: {}, hd: 6, weaponArmor: 'Any weapon. Leather and lighter armor.', features: ['Thieving Skills (Allocated percentage points)', 'Backstab (+4 attack and multiplier on unaware foes: x2 lvl 1-4, x3 lvl 5-8, x4 lvl 9-12, x5 lvl 13+)', 'Thieves\' Cant (Secret argot)'] },
  bard: { name: 'Bard', group: 'rogue', prime: ['cha'], req: { dex: 12, int: 13, cha: 13 }, hd: 6, weaponArmor: 'Any weapon. Leather/lighter for performance.', features: ['Legend Lore (Historical/regional knowledge)', 'Inspire Competence (+1 attack/saves to allies within 9m)', 'Bardic Charm (+1/2 level to reaction checks)', 'Spellcasting (Wizard spells from level 2; no grimoire)', 'Thieving Skills (Pick Pockets, Hear Noise, Climb, Read Lang)', 'Reputation and the Vithurian Orchestra (Level 10)'] }
}

const CLASS_GROUPS = {
  warrior: { hitDice: 'd10', attackBonus: '1/level', saves: { fort: 'strong', ref: 'strong', will: 'weak' } },
  wizard: { hitDice: 'd4', attackBonus: '1/3 levels', saves: { fort: 'weak', ref: 'weak', will: 'strong' } },
  priest: { hitDice: 'd8', attackBonus: '1/2 levels', saves: { fort: 'strong', ref: 'weak', will: 'strong' } },
  rogue: { hitDice: 'd6', attackBonus: '1/2 levels', saves: { fort: 'weak', ref: 'strong', will: 'weak' } }
}

const LIFE_STAGES = {
  adult: { name: 'Adult', mod: {}, caps: {}, sp: 0 },
  middle: { name: 'Middle Age', mod: { str: -1, con: -1, int: 1, wis: 1 }, caps: { str: 17, dex: 18, con: 17 }, sp: 2 },
  old: { name: 'Old Age', mod: { str: -3, dex: -2, con: -2, int: 1, wis: 2 }, caps: { str: 15, dex: 16, con: 15 }, sp: 4 },
  venerable: { name: 'Venerable', mod: { str: -4, dex: -3, con: -3, int: 2, wis: 3 }, caps: { str: 14, dex: 14, con: 13 }, sp: 6 }
}

// Starting money rollers
const STARTING_MONEY = {
  warrior: { formula: '5d4 * 10', rolls: 5 },
  wizard: { formula: '(1d4 + 1) * 10', rolls: 1 },
  rogue: { formula: '2d6 * 10', rolls: 2 },
  priest: { formula: '3d6 * 10', rolls: 3 }
}

// Skills List
const SKILLS = [
  // General Skills
  { name: 'Acrobatics', category: 'general', req: 'Rogue', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Animal Handling', category: 'general', req: 'General', attr: 'wis', cost: 2, trainedOnly: false }, // Ranger/Druid pay 1 (handle specially)
  { name: 'Charioteer', category: 'general', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Climbing', category: 'general', req: 'General', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Disguise', category: 'general', req: 'Rogue', attr: 'cha', cost: 1, trainedOnly: false },
  { name: 'Endurance', category: 'general', req: 'Rogue/Warrior', attr: 'con', cost: 2, trainedOnly: false },
  { name: 'Etiquette', category: 'general', req: 'General', attr: 'cha', cost: 1, trainedOnly: false },
  { name: 'Jumping', category: 'general', req: 'Rogue', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Read Lips', category: 'general', req: 'Rogue', attr: 'int', cost: 2, trainedOnly: true },
  { name: 'Riding, Land', category: 'general', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Set Snares and Traps', category: 'general', req: 'Rogue/Warrior', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Survival', category: 'general', req: 'General', attr: 'wis', cost: 1, trainedOnly: false },
  { name: 'Swimming', category: 'general', req: 'General', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Use Rope', category: 'general', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  
  // Class-restricted
  { name: 'Appraise', category: 'class', req: 'Rogue', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Blind-Fight', category: 'class', req: 'Rogue/Warrior', attr: 'none', cost: 2, trainedOnly: false },
  { name: 'Cross-Country Running', category: 'class', req: 'Warrior', attr: 'con', cost: 1, trainedOnly: false },
  { name: 'Forgery', category: 'class', req: 'Rogue', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Healing', category: 'class', req: 'Priest', attr: 'wis', cost: 2, trainedOnly: true },
  { name: 'Read/Write Language', category: 'class', req: 'Rogue/Wizard', attr: 'none', cost: 1, trainedOnly: false },
  { name: 'Spellcraft', category: 'class', req: 'Wizard', attr: 'int', cost: 1, trainedOnly: true },
  { name: 'Tracking', category: 'class', req: 'Rogue/Warrior', attr: 'wis', cost: 2, trainedOnly: false },

  // Knowledge
  { name: 'Ancient History', category: 'knowledge', req: 'Priest/Rogue/Wizard', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Animal Lore', category: 'knowledge', req: 'Warrior/Priest', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Astrology', category: 'knowledge', req: 'Priest/Wizard', attr: 'int', cost: 2, trainedOnly: false },
  { name: 'Engineering', category: 'knowledge', req: 'General', attr: 'int', cost: 2, trainedOnly: true },
  { name: 'Gaming', category: 'knowledge', req: 'Rogue/Warrior', attr: 'cha', cost: 1, trainedOnly: false },
  { name: 'Herbalism', category: 'knowledge', req: 'Priest/Rogue/Wizard', attr: 'int', cost: 2, trainedOnly: false },
  { name: 'Local History', category: 'knowledge', req: 'Priest/Rogue', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Navigation', category: 'knowledge', req: 'General', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Religion', category: 'knowledge', req: 'Priest/Wizard', attr: 'wis', cost: 1, trainedOnly: false },
  
  // Performance
  { name: 'Dance', category: 'performance', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Instrument', category: 'performance', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Juggling', category: 'performance', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Singing', category: 'performance', req: 'General', attr: 'cha', cost: 1, trainedOnly: false },

  // Trade
  { name: 'Agriculture', category: 'trade', req: 'General', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Armorer', category: 'trade', req: 'Warrior', attr: 'int', cost: 2, trainedOnly: true },
  { name: 'Artist (Field)', category: 'trade', req: 'General', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Blacksmith', category: 'trade', req: 'General', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Bowyer/Fletcher', category: 'trade', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Brewing', category: 'trade', req: 'General', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Carpentry', category: 'trade', req: 'General', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Cobbler', category: 'trade', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Cooking', category: 'trade', req: 'General', attr: 'int', cost: 1, trainedOnly: false },
  { name: 'Gemcutting', category: 'trade', req: 'Rogue', attr: 'dex', cost: 2, trainedOnly: true },
  { name: 'Leatherworking', category: 'trade', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Mason', category: 'trade', req: 'General', attr: 'str', cost: 1, trainedOnly: false },
  { name: 'Mining', category: 'trade', req: 'Warrior', attr: 'wis', cost: 2, trainedOnly: true },
  { name: 'Seamstress/Tailor', category: 'trade', req: 'General', attr: 'dex', cost: 1, trainedOnly: false },
  { name: 'Shipwright', category: 'trade', req: 'General', attr: 'int', cost: 2, trainedOnly: true },
  { name: 'Weaponsmith', category: 'trade', req: 'Warrior', attr: 'int', cost: 3, trainedOnly: true },
  { name: 'Weaving', category: 'trade', req: 'General', attr: 'int', cost: 1, trainedOnly: false }
]

// Equipment Shop database
const WEAPONS = [
  { name: 'Battle axe', cost: 5, weight: 3.5, size: 'M', type: 'S', speed: 7, dmgSM: '1d8', dmgL: '1d8', category: 'melee' },
  { name: 'Club', cost: 0, weight: 1.5, size: 'M', type: 'B', speed: 4, dmgSM: '1d6', dmgL: '1d3', category: 'melee' },
  { name: 'Dagger/dirk', cost: 2, weight: 0.5, size: 'S', type: 'P', speed: 2, dmgSM: '1d4', dmgL: '1d3', category: 'melee' },
  { name: "Footman's flail", cost: 15, weight: 7.5, size: 'M', type: 'B', speed: 7, dmgSM: '1d6+1', dmgL: '2d4', category: 'melee' },
  { name: "Footman's mace", cost: 8, weight: 5, size: 'M', type: 'B', speed: 7, dmgSM: '1d6+1', dmgL: '1d6', category: 'melee' },
  { name: "Footman's pick", cost: 8, weight: 3, size: 'M', type: 'P', speed: 7, dmgSM: '1d6+1', dmgL: '2d4', category: 'melee' },
  { name: 'Hand axe', cost: 1, weight: 2.5, size: 'M', type: 'S', speed: 4, dmgSM: '1d6', dmgL: '1d4', category: 'melee' },
  { name: 'Javelin', cost: 0.5, weight: 1, size: 'M', type: 'P', speed: 4, dmgSM: '1d6', dmgL: '1d6', category: 'melee' },
  { name: 'Knife', cost: 0.5, weight: 0.25, size: 'S', type: 'P/S', speed: 2, dmgSM: '1d3', dmgL: '1d2', category: 'melee' },
  { name: 'Quarterstaff', cost: 0, weight: 2, size: 'L', type: 'B', speed: 4, dmgSM: '1d6', dmgL: '1d6', category: 'melee' },
  { name: 'Spear', cost: 0.8, weight: 2.5, size: 'M', type: 'P', speed: 6, dmgSM: '1d6', dmgL: '1d8', category: 'melee' },
  { name: 'Sword, bastard (1H)', cost: 25, weight: 5, size: 'M', type: 'S', speed: 6, dmgSM: '1d8', dmgL: '1d12', category: 'melee' },
  { name: 'Sword, bastard (2H)', cost: 25, weight: 5, size: 'M', type: 'S', speed: 8, dmgSM: '2d4', dmgL: '2d8', category: 'melee' },
  { name: 'Sword, broad', cost: 10, weight: 2, size: 'M', type: 'S', speed: 5, dmgSM: '2d4', dmgL: '1d6+1', category: 'melee' },
  { name: 'Sword, cutlass', cost: 12, weight: 2, size: 'M', type: 'S', speed: 5, dmgSM: '1d6', dmgL: '1d8', category: 'melee' },
  { name: 'Sword, long', cost: 15, weight: 2, size: 'M', type: 'S', speed: 5, dmgSM: '1d8', dmgL: '1d12', category: 'melee' },
  { name: 'Sword, scimitar', cost: 15, weight: 2, size: 'M', type: 'S', speed: 5, dmgSM: '1d8', dmgL: '1d8', category: 'melee' },
  { name: 'Sword, short', cost: 10, weight: 1.5, size: 'S', type: 'P', speed: 3, dmgSM: '1d6', dmgL: '1d8', category: 'melee' },
  { name: 'Sword, two-handed', cost: 50, weight: 7.5, size: 'L', type: 'S', speed: 10, dmgSM: '1d10', dmgL: '3d6', category: 'melee' },
  { name: 'War hammer', cost: 2, weight: 3, size: 'M', type: 'B', speed: 4, dmgSM: '1d4+1', dmgL: '1d4', category: 'melee' },
  
  // Pole Arms
  { name: 'Awl pike', cost: 5, weight: 6, size: 'L', type: 'P', speed: 13, dmgSM: '1d6', dmgL: '1d12', category: 'pole' },
  { name: 'Bardiche', cost: 7, weight: 6, size: 'L', type: 'S', speed: 9, dmgSM: '2d4', dmgL: '2d6', category: 'pole' },
  { name: 'Halberd', cost: 10, weight: 7.5, size: 'L', type: 'P/S', speed: 9, dmgSM: '1d10', dmgL: '2d6', category: 'pole' },
  { name: 'Military fork', cost: 5, weight: 3.5, size: 'L', type: 'P', speed: 7, dmgSM: '1d8', dmgL: '2d4', category: 'pole' },
  
  // Ranged
  { name: 'Bow, long', cost: 75, weight: 1.5, size: 'L', type: 'P', speed: 8, rof: '2/1', range: '65/125/190', category: 'ranged' },
  { name: 'Bow, short', cost: 30, weight: 1, size: 'M', type: 'P', speed: 7, rof: '2/1', range: '45/90/150', category: 'ranged' },
  { name: 'Crossbow, heavy', cost: 50, weight: 7, size: 'M', type: 'P', speed: 10, rof: '1/2', range: '70/145/215', category: 'ranged' },
  { name: 'Crossbow, light', cost: 35, weight: 3.5, size: 'M', type: 'P', speed: 7, rof: '1', range: '55/110/160', category: 'ranged' },
  { name: 'Sling', cost: 0.05, weight: 0.05, size: 'S', type: 'B', speed: 6, rof: '1', range: '45/90/180', category: 'ranged' }
]

const ARMOR = [
  { name: 'Padded', cost: 4, weight: 5, ac: 12, vul: '', res: '' },
  { name: 'Leather', cost: 5, weight: 7.5, ac: 12, vul: 'Slashing', res: '' },
  { name: 'Studded leather', cost: 20, weight: 12.5, ac: 13, vul: '', res: '' },
  { name: 'Brigandine', cost: 120, weight: 17.5, ac: 14, vul: '', res: '' },
  { name: 'Scale mail', cost: 120, weight: 20, ac: 14, vul: '', res: '' },
  { name: 'Chain mail', cost: 75, weight: 20, ac: 15, vul: 'Piercing', res: 'Slashing' },
  { name: 'Banded mail', cost: 200, weight: 17.5, ac: 16, vul: '', res: '' },
  { name: 'Splint mail', cost: 80, weight: 20, ac: 16, vul: '', res: '' },
  { name: 'Bronze plate mail', cost: 400, weight: 22.5, ac: 16, vul: 'Bludgeoning', res: 'Slashing' },
  { name: 'Plate mail', cost: 600, weight: 25, ac: 17, vul: 'Bludgeoning', res: 'Slashing' },
  { name: 'Field plate', cost: 2000, weight: 30, ac: 18, vul: 'Bludgeoning', res: 'Slashing' },
  { name: 'Full plate', cost: 5000, weight: 35, ac: 19, vul: 'Bludgeoning', res: 'Slashing' }
]

const SHIELDS = [
  { name: 'Buckler', cost: 1, weight: 1.5, acBonus: 1, coverage: '1 frontal' },
  { name: 'Small', cost: 3, weight: 2.5, acBonus: 1, coverage: '2 frontal' },
  { name: 'Medium', cost: 7, weight: 5, acBonus: 1, coverage: '3 frontal' },
  { name: 'Body/tower', cost: 10, weight: 7.5, acBonus: 1, coverage: 'All frontal' }
]

const HELMETS = [
  { name: 'Cap', cost: 4, weight: 1, match: 'Light' },
  { name: 'Coif', cost: 8, weight: 2.5, match: 'Medium' },
  { name: 'Open-face', cost: 15, weight: 2.5, match: 'Medium/Heavy' },
  { name: 'Basinet/closed-face', cost: 20, weight: 5, match: 'Heavy' },
  { name: 'Great helm', cost: 30, weight: 5, match: 'Heavy' }
]

const MISC_ITEMS = [
  { name: 'Backpack', cost: 2, weight: 1 },
  { name: 'Belt pouch, large', cost: 1, weight: 0.5 },
  { name: 'Belt pouch, small', cost: 0.7, weight: 0.25 },
  { name: 'Rope, hemp (15m)', cost: 1, weight: 10 },
  { name: 'Rope, silk (15m)', cost: 10, weight: 4 },
  { name: 'Flint and steel', cost: 0.5, weight: 0.05 },
  { name: 'Torch', cost: 0.01, weight: 0.5 },
  { name: 'Lamp oil (flask)', cost: 0.06, weight: 0.5 },
  { name: 'Lantern, hooded', cost: 7, weight: 1 },
  { name: 'Lantern, bull\'s-eye', cost: 12, weight: 1.5 },
  { name: 'Iron pot', cost: 0.5, weight: 1 },
  { name: 'Piton', cost: 0.03, weight: 0.25 },
  { name: 'Thieves\' picks', cost: 30, weight: 0.5 },
  { name: 'Waterskin', cost: 0.8, weight: 0.5 },
  { name: 'Dry rations (1 week)', cost: 10, weight: 1.5 },
  { name: 'Holy item', cost: 25, weight: 0.05 },
  { name: 'Component pouch', cost: 15, weight: 1 }
]

// --- STATE MANAGEMENT ---

const activeTab = ref('core')
const characterName = ref('Valen Thorne')
const playerName = ref('')
const homeland = ref('')
const religion = ref('')
const alignment = ref('Neutral')
const ancestry = ref('human')
const primaryClass = ref('fighter')
const secondaryClass = ref('')
const levelPrimary = ref(1)
const levelSecondary = ref(0)
const startingAge = ref(20)
const lifeStage = ref('adult')

// Ability Scores Inputs
const scoresRaw = ref({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 })
const exceptionalPercent = ref(0) // Percentile if STR is 18 and class group is Warrior

// Custom rolls if assigning manually
const assignedScores = ref({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 })
const rollMethod = ref('pointbuy')
const rolledValues = ref([])
const pointBuyBalance = ref(30)

// HP rolled values (allow customizing)
const hpInput = ref(0)
const hpRolls = ref([]) // Level-by-level history

// Skills State
const selectedSkills = ref([]) // array of skill names
const skillPointSpend = ref(0)
const thievingSkillsPoints = ref({ pickPockets: 15, openLocks: 10, findTraps: 5, moveSilently: 10, hideShadows: 5, hearNoise: 10, climbWalls: 60, readLanguages: 0 })

// Equipment & Inventory State
const inventory = ref([])
const goldPieces = ref(100)
const goldTreasures = ref({ sp: 0, cp: 0, gems: '' })
const equippedArmor = ref(null)
const equippedShield = ref(null)
const equippedHelmet = ref(null)
const supplies = ref({ water: 6, rations: 6 })

// Spell State
const selectedSpells = ref([]) // list of spell objects
const mageSpecialistSchool = ref('')
const mageSchoolOpposition = ref('')
const mageSpecialistName = ref('')
const sorcererPatron = ref('')
const priestDeity = ref('')

// VTT Import/Export state
const importError = ref('')

// --- HELPER COMPUTED VALUES & CALCULATIONS ---

// Get active class group
const classGroup = computed(() => CLASSES[primaryClass.value]?.group || 'warrior')
const secondaryClassGroup = computed(() => secondaryClass.value ? CLASSES[secondaryClass.value]?.group : null)

// Determine if character qualifies as a Warrior in any class
const isWarrior = computed(() => {
  if (classGroup.value === 'warrior') return true
  if (secondaryClass.value && secondaryClassGroup.value === 'warrior') return true
  return false
})

const isPriest = computed(() => {
  if (classGroup.value === 'priest') return true
  if (secondaryClass.value && secondaryClassGroup.value === 'priest') return true
  return false
})

const isWizard = computed(() => {
  if (classGroup.value === 'wizard') return true
  if (secondaryClass.value && secondaryClassGroup.value === 'wizard') return true
  return false
})

const isRogue = computed(() => {
  if (classGroup.value === 'rogue') return true
  if (secondaryClass.value && secondaryClassGroup.value === 'rogue') return true
  return false
})

// Calculate Ability Score modifiers based on final adjusted scores
const finalScores = computed(() => {
  const scores = { ...scoresRaw.value }
  
  // 1. Ancestry Adjustments
  const adj = ANCESTRIES[ancestry.value]?.adj || {}
  for (const k in adj) {
    scores[k] = (scores[k] || 10) + adj[k]
  }
  
  // 2. Age Modifiers
  const ageMod = LIFE_STAGES[lifeStage.value]?.mod || {}
  for (const k in ageMod) {
    scores[k] = (scores[k] || 10) + ageMod[k]
  }
  
  // 3. Age Maximum caps (apply to STR, DEX, CON)
  const caps = LIFE_STAGES[lifeStage.value]?.caps || {}
  for (const k in caps) {
    if (scores[k] > caps[k]) {
      scores[k] = caps[k]
    }
  }

  // Ensure absolute bounds (min 3, max 25)
  for (const k in scores) {
    scores[k] = Math.max(3, Math.min(25, scores[k]))
  }

  return scores
})

// Check if raw ability scores qualify for the chosen ancestry
const ancestryCheckResult = computed(() => {
  const reqs = ANCESTRIES[ancestry.value]?.requirements || {}
  const raw = scoresRaw.value
  const errors = []
  
  // Badaki / Urgon require STR & CON >= 13 raw
  if ((ancestry.value === 'badaki' || ancestry.value === 'urgon')) {
    if (raw.str < 13 || raw.con < 13) {
      errors.push('Requires both Strength and Constitution to be 13 or higher before modifiers.')
    }
  }
  
  for (const attr in reqs) {
    const [min, max] = reqs[attr]
    if (raw[attr] < min || raw[attr] > max) {
      errors.push(`Raw ${attr.toUpperCase()} must be between ${min} and ${max} (Current raw: ${raw[attr]})`)
    }
  }
  
  return { valid: errors.length === 0, errors }
})

// Check if raw/final scores qualify for class & multiclass
const classCheckResult = computed(() => {
  const final = finalScores.value
  const raw = scoresRaw.value
  const errors = []
  
  // Primary Class requirements
  const primaryReq = CLASSES[primaryClass.value]?.req || {}
  for (const attr in primaryReq) {
    if (final[attr] < primaryReq[attr]) {
      errors.push(`Primary class ${CLASSES[primaryClass.value].name} requires ${attr.toUpperCase()} ${primaryReq[attr]}+`)
    }
  }
  
  // Primary Class Ancestry restricts
  const primaryRestr = CLASSES[primaryClass.value]?.ancestries
  if (primaryRestr && !primaryRestr.includes(ancestry.value)) {
    errors.push(`Primary class ${CLASSES[primaryClass.value].name} is unavailable to ancestry ${ANCESTRIES[ancestry.value].name}`)
  }
  const primaryUnavail = CLASSES[primaryClass.value]?.unavailable
  if (primaryUnavail && primaryUnavail.includes(ancestry.value)) {
    errors.push(`Primary class ${CLASSES[primaryClass.value].name} is unavailable to ancestry ${ANCESTRIES[ancestry.value].name}`)
  }
  
  // Secondary Class requirements & checks
  if (secondaryClass.value) {
    const secReq = CLASSES[secondaryClass.value]?.req || {}
    for (const attr in secReq) {
      if (final[attr] < secReq[attr]) {
        errors.push(`Secondary class ${CLASSES[secondaryClass.value].name} requires ${attr.toUpperCase()} ${secReq[attr]}+`)
      }
    }
    
    // Multiclass entry core attribute must be 13+
    const entryAttr = getMulticlassCoreAttr(secondaryClass.value)
    if (final[entryAttr] < 13) {
      errors.push(`Multiclass secondary entry requires ${entryAttr.toUpperCase()} 13 or higher (Current: ${final[entryAttr]})`)
    }
    
    // Secondary Class Ancestry restricts
    const secRestr = CLASSES[secondaryClass.value]?.ancestries
    if (secRestr && !secRestr.includes(ancestry.value)) {
      errors.push(`Secondary class ${CLASSES[secondaryClass.value].name} is unavailable to ancestry ${ANCESTRIES[ancestry.value].name}`)
    }
    const secUnavail = CLASSES[secondaryClass.value]?.unavailable
    if (secUnavail && secUnavail.includes(ancestry.value)) {
      errors.push(`Secondary class ${CLASSES[secondaryClass.value].name} is unavailable to ancestry ${ANCESTRIES[ancestry.value].name}`)
    }

    if (secondaryClass.value === primaryClass.value) {
      errors.push('Primary and Secondary classes cannot be the same.')
    }
  }

  return { valid: errors.length === 0, errors }
})

function getMulticlassCoreAttr(cls) {
  const grp = CLASSES[cls]?.group
  if (grp === 'warrior') return 'str'
  if (cls === 'mage') return 'int'
  if (cls === 'sorcerer') return 'wis'
  if (grp === 'priest') return 'wis'
  if (grp === 'rogue') return 'dex'
  return 'str'
}

// Ability score detail calculations
const strDetails = computed(() => {
  const score = finalScores.value.str
  let atk = 0, dmg = 0, noEnc = 18, maxW = 52
  let force = 6, bend = 2
  
  if (score <= 1) { atk = -5; dmg = -4; noEnc = 0.5; maxW = 1.5; force = 1; bend = 0 }
  else if (score === 2) { atk = -3; dmg = -2; noEnc = 0.5; maxW = 2.5; force = 1; bend = 0 }
  else if (score === 3) { atk = -3; dmg = -1; noEnc = 2.5; maxW = 4.5; force = 2; bend = 0 }
  else if (score <= 5) { atk = -2; dmg = -1; noEnc = 4.5; maxW = 9; force = 3; bend = 0 }
  else if (score <= 7) { atk = -1; dmg = 0; noEnc = 9; maxW = 25; force = 4; bend = 0 }
  else if (score <= 9) { atk = 0; dmg = 0; noEnc = 16; maxW = 41; force = 5; bend = 1 }
  else if (score <= 11) { atk = 0; dmg = 0; noEnc = 18; maxW = 52; force = 6; bend = 2 }
  else if (score <= 13) { atk = 0; dmg = 0; noEnc = 20; maxW = 61; force = 7; bend = 4 }
  else if (score <= 15) { atk = 0; dmg = 0; noEnc = 25; maxW = 74; force = 8; bend = 7 }
  else if (score === 16) { atk = 0; dmg = 1; noEnc = 32; maxW = 81; force = 9; bend = 10 }
  else if (score === 17) { atk = 1; dmg = 1; noEnc = 38; maxW = 99; force = 10; bend = 13 }
  else if (score === 18) {
    if (isWarrior.value) {
      const pct = exceptionalPercent.value
      if (pct === 0) { atk = 1; dmg = 2; noEnc = 50; maxW = 115; force = 11; bend = 16 }
      else if (pct <= 50) { atk = 1; dmg = 3; noEnc = 61; maxW = 126; force = 12; bend = 20 }
      else if (pct <= 75) { atk = 2; dmg = 3; noEnc = 72; maxW = 140; force = 13; bend = 25 }
      else if (pct <= 90) { atk = 2; dmg = 4; noEnc = 83; maxW = 150; force = 14; bend = 30 }
      else if (pct <= 99) { atk = 2; dmg = 5; noEnc = 105; maxW = 170; force = 15; bend = 35 }
      else { atk = 3; dmg = 6; noEnc = 150; maxW = 215; force = 16; bend = 40 }
    } else {
      atk = 1; dmg = 2; noEnc = 50; maxW = 115; force = 11; bend = 16
    }
  }
  else if (score === 19) { atk = 3; dmg = 7; noEnc = 220; maxW = 290; force = 16; bend = 50 }
  else if (score === 20) { atk = 3; dmg = 8; noEnc = 240; maxW = 315; force = 17; bend = 60 }
  else if (score === 21) { atk = 4; dmg = 9; noEnc = 285; maxW = 365; force = 17; bend = 70 }
  else if (score === 22) { atk = 4; dmg = 10; noEnc = 355; maxW = 435; force = 18; bend = 80 }
  else if (score === 23) { atk = 5; dmg = 11; noEnc = 420; maxW = 510; force = 18; bend = 90 }
  else if (score === 24) { atk = 6; dmg = 12; noEnc = 555; maxW = 650; force = 19; bend = 95 }
  else if (score >= 25) { atk = 7; dmg = 14; noEnc = 690; maxW = 790; force = 19; bend = 99 }

  // Size adjustments under Encumbrance for Other Sizes
  let encMult = 1.0
  if (ANCESTRIES[ancestry.value]?.size === 'Large') {
    encMult = 2.0
  }
  
  return { atk, dmg, noEnc: noEnc * encMult, maxW: maxW * encMult, force, bend }
})

const dexDetails = computed(() => {
  const score = finalScores.value.dex
  let surprise = 0, missile = 0, acMod = 0
  
  if (score <= 1) { surprise = -6; missile = -6; acMod = -5 }
  else if (score === 2) { surprise = -4; missile = -4; acMod = -5 }
  else if (score === 3) { surprise = -3; missile = -3; acMod = -4 }
  else if (score === 4) { surprise = -2; missile = -2; acMod = -3 }
  else if (score === 5) { surprise = -1; missile = -1; acMod = -2 }
  else if (score <= 8) { surprise = 0; missile = 0; acMod = -1 }
  else if (score <= 14) { surprise = 0; missile = 0; acMod = 0 }
  else if (score === 15) { surprise = 0; missile = 0; acMod = 1 }
  else if (score === 16) { surprise = 1; missile = 1; acMod = 2 }
  else if (score <= 18) { surprise = 2; missile = 2; acMod = 3 }
  else if (score <= 21) { surprise = 3; missile = 3; acMod = 4 }
  else if (score <= 23) { surprise = 4; missile = 4; acMod = 5 }
  else if (score >= 24) { surprise = 5; missile = 5; acMod = 6 }
  
  return { surprise, missile, acMod }
})

const conDetails = computed(() => {
  const score = finalScores.value.con
  let hp = 0, poison = 0, shock = '70%', res = '75%'
  
  if (score <= 3) { hp = -2; poison = -2; shock = '25%'; res = '30%' }
  else if (score === 4) { hp = -1; poison = -1; shock = '30%'; res = '35%' }
  else if (score === 5) { hp = -1; poison = 0; shock = '35%'; res = '40%' }
  else if (score === 6) { hp = 0; poison = 0; shock = '40%'; res = '45%' }
  else if (score === 7) { hp = 0; poison = 0; shock = '55%'; res = '60%' }
  else if (score === 8) { hp = 0; poison = 0; shock = '60%'; res = '65%' }
  else if (score === 9) { hp = 0; poison = 0; shock = '65%'; res = '70%' }
  else if (score === 10) { hp = 0; poison = 0; shock = '70%'; res = '75%' }
  else if (score === 11) { hp = 0; poison = 0; shock = '75%'; res = '80%' }
  else if (score === 12) { hp = 0; poison = 0; shock = '80%'; res = '85%' }
  else if (score === 13) { hp = 0; poison = 0; shock = '85%'; res = '90%' }
  else if (score === 14) { hp = 0; poison = 0; shock = '88%'; res = '92%' }
  else if (score === 15) { hp = 1; poison = 0; shock = '90%'; res = '94%' }
  else if (score === 16) { hp = 2; poison = 0; shock = '95%'; res = '96%' }
  else if (score === 17) { hp = 3; poison = 0; shock = '97%'; res = '98%' }
  else if (score === 18) { hp = 4; poison = 0; shock = '99%'; res = '100%' }
  else if (score === 19) { hp = 5; poison = 1; shock = '99%'; res = '100%' }
  else if (score === 20) { hp = 5; poison = 1; shock = '99%'; res = '100%' }
  else if (score <= 23) { hp = 6; poison = 2; shock = '99%'; res = '100%' }
  else if (score === 24) { hp = 7; poison = 3; shock = '99%'; res = '100%' }
  else if (score >= 25) { hp = 7; poison = 4; shock = '100%'; res = '100%' }

  // Adjust for non-warrior class HP cap (max +2)
  let maxHpBonus = hp
  if (!isWarrior.value && maxHpBonus > 2) {
    maxHpBonus = 2
  }

  return { hp: maxHpBonus, poison, shock, res }
})

const intDetails = computed(() => {
  const score = finalScores.value.int
  let lang = 1, maxLvl = '—', maxSp = '—', learn = '—'
  
  if (score <= 1) { lang = 0; maxLvl = '—'; maxSp = '—'; learn = '—' }
  else if (score <= 8) { lang = 1; maxLvl = '—'; maxSp = '—'; learn = '—' }
  else if (score === 9) { lang = 2; maxLvl = '4th'; maxSp = '6'; learn = '35%' }
  else if (score === 10) { lang = 2; maxLvl = '5th'; maxSp = '7'; learn = '40%' }
  else if (score === 11) { lang = 2; maxLvl = '5th'; maxSp = '7'; learn = '45%' }
  else if (score === 12) { lang = 3; maxLvl = '6th'; maxSp = '7'; learn = '50%' }
  else if (score === 13) { lang = 3; maxLvl = '6th'; maxSp = '9'; learn = '55%' }
  else if (score === 14) { lang = 4; maxLvl = '7th'; maxSp = '9'; learn = '60%' }
  else if (score === 15) { lang = 4; maxLvl = '7th'; maxSp = '11'; learn = '65%' }
  else if (score === 16) { lang = 5; maxLvl = '8th'; maxSp = '11'; learn = '70%' }
  else if (score === 17) { lang = 6; maxLvl = '8th'; maxSp = '14'; learn = '75%' }
  else if (score === 18) { lang = 7; maxLvl = '9th'; maxSp = '18'; learn = '85%' }
  else if (score === 19) { lang = 8; maxLvl = '9th'; maxSp = '24'; learn = '95%' }
  else if (score === 20) { lang = 9; maxLvl = '9th'; maxSp = '30'; learn = '96%' }
  else if (score <= 23) { lang = score - 11; maxLvl = '9th'; maxSp = '30'; learn = `${97 + (score - 21)}%` }
  else if (score === 24) { lang = 15; maxLvl = '9th'; maxSp = '30'; learn = '100%' }
  else if (score >= 25) { lang = 20; maxLvl = '9th'; maxSp = '30'; learn = '100%' }

  return { lang, maxLvl, maxSp, learn }
})

const wisDetails = computed(() => {
  const score = finalScores.value.wis
  let def = 0, bonus = '—', fail = '0%'
  
  if (score === 1) { def = 0; fail = '80%' }
  else if (score === 2) { def = 0; fail = '60%' }
  else if (score === 3) { def = 0; fail = '50%' }
  else if (score === 4) { def = 0; fail = '45%' }
  else if (score === 5) { def = 0; fail = '40%' }
  else if (score === 6) { def = 0; fail = '35%' }
  else if (score === 7) { def = 0; fail = '30%' }
  else if (score === 8) { def = 0; fail = '25%' }
  else if (score === 9) { def = 0; fail = '20%' }
  else if (score === 10) { def = 0; fail = '15%' }
  else if (score === 11) { def = 0; fail = '10%' }
  else if (score === 12) { def = 0; fail = '5%' }
  else if (score <= 14) { def = 0; bonus = '1st'; fail = '0%' }
  else if (score === 15) { def = 1; bonus = '2nd'; fail = '0%' }
  else if (score === 16) { def = 2; bonus = '2nd'; fail = '0%' }
  else if (score === 17) { def = 3; bonus = '3rd'; fail = '0%' }
  else if (score === 18) { def = 4; bonus = '4th'; fail = '0%' }
  else if (score === 19) { def = 4; bonus = '1st, 4th'; fail = '0%' }
  else if (score === 20) { def = 4; bonus = '2nd, 4th'; fail = '0%' }
  else if (score === 21) { def = 4; bonus = '3rd, 5th'; fail = '0%' }
  else if (score === 22) { def = 4; bonus = '4th, 5th'; fail = '0%' }
  else if (score === 23) { def = 4; bonus = '5th, 5th'; fail = '0%' }
  else if (score === 24) { def = 4; bonus = '6th, 6th'; fail = '0%' }
  else if (score >= 25) { def = 4; bonus = '6th, 7th'; fail = '0%' }

  return { def, bonus, fail }
})

const chaDetails = computed(() => {
  const score = finalScores.value.cha
  let hench = 4, loyalty = 0, react = 0
  
  if (score === 1) { hench = 0; loyalty = -8; react = -7 }
  else if (score === 2) { hench = 1; loyalty = -7; react = -6 }
  else if (score === 3) { hench = 1; loyalty = -6; react = -5 }
  else if (score === 4) { hench = 1; loyalty = -5; react = -4 }
  else if (score === 5) { hench = 2; loyalty = -4; react = -3 }
  else if (score === 6) { hench = 2; loyalty = -3; react = -2 }
  else if (score === 7) { hench = 3; loyalty = -2; react = -1 }
  else if (score === 8) { hench = 3; loyalty = -1; react = 0 }
  else if (score <= 11) { hench = 4; loyalty = 0; react = 0 }
  else if (score === 12) { hench = 5; loyalty = 0; react = 0 }
  else if (score === 13) { hench = 5; loyalty = 0; react = 1 }
  else if (score === 14) { hench = 6; loyalty = 1; react = 2 }
  else if (score === 15) { hench = 7; loyalty = 3; react = 3 }
  else if (score === 16) { hench = 8; loyalty = 4; react = 5 }
  else if (score === 17) { hench = 10; loyalty = 6; react = 6 }
  else if (score === 18) { hench = 15; loyalty = 8; react = 7 }
  else if (score === 19) { hench = 20; loyalty = 10; react = 8 }
  else if (score === 20) { hench = 25; loyalty = 12; react = 9 }
  else if (score === 21) { hench = 30; loyalty = 14; react = 10 }
  else if (score === 22) { hench = 35; loyalty = 16; react = 11 }
  else if (score === 23) { hench = 40; loyalty = 18; react = 12 }
  else if (score === 24) { hench = 45; loyalty = 20; react = 13 }
  else if (score >= 25) { hench = 50; loyalty = 20; react = 14 }

  return { hench, loyalty, react }
})

// --- MULTICLASS & ATTACK PROGRESSION ---

const levelText = computed(() => {
  if (secondaryClass.value) {
    return `${CLASSES[primaryClass.value].name} ${levelPrimary.value} / ${CLASSES[secondaryClass.value].name} ${levelSecondary.value}`
  }
  return `${CLASSES[primaryClass.value].name} ${levelPrimary.value}`
})

// Calculate Attack Bonus
const attackBonus = computed(() => {
  const calcAB = (grp, lvl) => {
    if (grp === 'warrior') return lvl
    if (grp === 'wizard') return Math.floor(lvl / 3)
    if (grp === 'priest' || grp === 'rogue') return Math.floor(lvl / 2)
    return 0
  }

  const pAB = calcAB(classGroup.value, levelPrimary.value)
  if (secondaryClass.value) {
    const sAB = calcAB(secondaryClassGroup.value, levelSecondary.value)
    return Math.max(pAB, sAB)
  }
  return pAB
})

// Calculate Saving Throws
const saves = computed(() => {
  const getSaveValue = (grp, saveType, lvl, baseScore) => {
    const rate = CLASS_GROUPS[grp].saves[saveType]
    const mod = rate === 'strong' ? Math.floor(lvl / 4) : Math.floor(lvl / 8)
    return baseScore + mod
  }

  // Fortitude uses CON, Reflex uses DEX, Will uses WIS
  const pFort = getSaveValue(classGroup.value, 'fort', levelPrimary.value, finalScores.value.con)
  const pRef = getSaveValue(classGroup.value, 'ref', levelPrimary.value, finalScores.value.dex)
  const pWill = getSaveValue(classGroup.value, 'will', levelPrimary.value, finalScores.value.wis)

  let fort = pFort
  let ref = pRef
  let will = pWill

  if (secondaryClass.value) {
    const sFort = getSaveValue(secondaryClassGroup.value, 'fort', levelSecondary.value, finalScores.value.con)
    const sRef = getSaveValue(secondaryClassGroup.value, 'ref', levelSecondary.value, finalScores.value.dex)
    const sWill = getSaveValue(secondaryClassGroup.value, 'will', levelSecondary.value, finalScores.value.wis)
    
    fort = Math.max(pFort, sFort)
    ref = Math.max(pRef, sRef)
    will = Math.max(pWill, sWill)
  }

  // Apply Paladin +2 modifier (stacks with all saves)
  if (primaryClass.value === 'paladin' || secondaryClass.value === 'paladin') {
    fort += 2
    ref += 2
    will += 2
  }

  // Wisdom defense modifier adds to Will saves
  will += wisDetails.value.def

  // Dexterity surprise modifier adds to Reflex saves
  ref += dexDetails.value.surprise

  return { fort, ref, will }
})

// Morale and Henchmen
const loyaltyModText = computed(() => {
  const mod = chaDetails.value.loyalty
  return mod >= 0 ? `+${mod}` : `${mod}`
})

const reactionModText = computed(() => {
  const mod = chaDetails.value.react
  return mod >= 0 ? `+${mod}` : `${mod}`
})

// --- HIT POINT GENERATOR ---

// Calculates the estimated or max HP
const hpMaximum = computed(() => {
  if (hpInput.value > 0) return hpInput.value
  
  // Calculate average HP based on level
  const calcAvgHP = (cls, lvl, conHpMod) => {
    const hd = CLASSES[cls].hd
    const grp = CLASSES[cls].group
    let total = 0
    
    // Level 1: Max hit die or rolled
    // We assume standard average for level 1 (or maxed out)
    let lvl1Hp = hd + conHpMod
    if (cls === 'ranger') lvl1Hp = 8 + conHpMod // Ranger starts with 1d8 at lvl 1
    total += Math.max(1, lvl1Hp)

    const hdLimit = grp === 'wizard' ? 10 : 9
    const maxHd = Math.min(lvl, hdLimit)
    
    // Roll average for remaining HD levels
    for (let i = 2; i <= maxHd; i++) {
      const avgRoll = (hd + 1) / 2
      total += Math.max(1, Math.round(avgRoll + conHpMod))
    }
    
    // Beyond HD limits, add flat HP bonuses per level
    if (lvl > hdLimit) {
      let flatBonus = 2
      if (grp === 'warrior') flatBonus = 3
      if (grp === 'wizard') flatBonus = 1
      total += (lvl - hdLimit) * flatBonus
    }
    
    return total
  }
  
  const conHpMod = conDetails.value.hp
  
  if (secondaryClass.value) {
    // Multiclass hit point roll: halved, rounded up for each level gained in either class
    // Fighter (d10) / Mage (d4)
    const pHP = calcAvgHP(primaryClass.value, levelPrimary.value, conHpMod)
    const sHP = calcAvgHP(secondaryClass.value, levelSecondary.value, conHpMod)
    return Math.ceil((pHP + sHP) / 2)
  }
  
  return calcAvgHP(primaryClass.value, levelPrimary.value, conHpMod)
})

// --- INVENTORY, WEIGHT & ENCUMBRANCE ---

// Add item to inventory
function addItemToInventory(item) {
  const existing = inventory.value.find(i => i.name === item.name)
  if (existing) {
    existing.qty++
  } else {
    inventory.value.push({ ...item, qty: 1, equipped: false })
  }
}

function removeItemFromInventory(index) {
  const item = inventory.value[index]
  if (item.qty > 1) {
    item.qty--
  } else {
    // Un-equip if it was equipped
    if (equippedArmor.value?.name === item.name) equippedArmor.value = null
    if (equippedShield.value?.name === item.name) equippedShield.value = null
    if (equippedHelmet.value?.name === item.name) equippedHelmet.value = null
    inventory.value.splice(index, 1)
  }
}

function toggleEquipItem(index) {
  const item = inventory.value[index]
  item.equipped = !item.equipped

  // If item is armor/shield/helmet, assign it
  if (item.equipped) {
    const isArmor = ARMOR.some(a => a.name === item.name)
    const isShield = SHIELDS.some(s => s.name === item.name)
    const isHelmet = HELMETS.some(h => h.name === item.name)

    if (isArmor) {
      // Un-equip previous armor
      inventory.value.forEach(i => { if (i.name !== item.name && ARMOR.some(a => a.name === i.name)) i.equipped = false })
      equippedArmor.value = ARMOR.find(a => a.name === item.name)
    }
    if (isShield) {
      inventory.value.forEach(i => { if (i.name !== item.name && SHIELDS.some(s => s.name === i.name)) i.equipped = false })
      equippedShield.value = SHIELDS.find(s => s.name === item.name)
    }
    if (isHelmet) {
      inventory.value.forEach(i => { if (i.name !== item.name && HELMETS.some(h => h.name === i.name)) i.equipped = false })
      equippedHelmet.value = HELMETS.find(h => h.name === item.name)
    }
  } else {
    if (equippedArmor.value?.name === item.name) equippedArmor.value = null
    if (equippedShield.value?.name === item.name) equippedShield.value = null
    if (equippedHelmet.value?.name === item.name) equippedHelmet.value = null
  }
}

// Calculate total inventory weight
const totalWeight = computed(() => {
  let wt = 0
  inventory.value.forEach(item => {
    wt += item.weight * item.qty
  })
  
  // Add coins weight: 0.5 kg per 50 coins
  const totalCoins = goldPieces.value + goldTreasures.value.sp + goldTreasures.value.cp
  wt += (totalCoins / 50) * 0.5

  // Supplies weight
  wt += supplies.value.water * 0.5 // 0.5kg per unit
  wt += supplies.value.rations * 0.25 // 0.25kg per unit

  return Math.round(wt * 10) / 10
})

// Calculate Armor Class (AC)
const armorClass = computed(() => {
  // Base AC: Unarmored is 10. Natural Armor is 7 for Badaki, Urgon, Vartran.
  let baseAC = 10
  const isNatural = ['badaki', 'urgon', 'vartran'].includes(ancestry.value)
  if (isNatural) {
    baseAC = 7
  }
  
  // If wearing armor, use the armor AC if it is better than natural
  let wornArmorAC = 10
  if (equippedArmor.value) {
    wornArmorAC = equippedArmor.value.ac
  }
  
  let currentBase = baseAC
  if (equippedArmor.value) {
    // Natural armor does not combine with worn armor. Use the best.
    currentBase = Math.max(baseAC, wornArmorAC)
  }

  // Add dexterity AC modifier
  let total = currentBase + dexDetails.value.acMod

  // Add shield AC modifier
  if (equippedShield.value) {
    total += equippedShield.value.acBonus
  }

  // Helmet modifier penalty: if wearing armor without matched helmet, -1 AC
  if (equippedArmor.value) {
    let hasMatchedHelmet = false
    if (equippedHelmet.value) {
      const hType = equippedHelmet.value.match
      const aName = equippedArmor.value.name
      // Padded, Leather, Studded are Light
      // Chain, Scale are Medium
      // Banded, Splint, Bronze, Plate, Field, Full are Heavy
      const aWeight = equippedArmor.value.weight
      if (aWeight <= 12.5 && hType.includes('Light')) hasMatchedHelmet = true
      else if (aWeight > 12.5 && aWeight <= 20 && (hType.includes('Medium') || hType.includes('Heavy'))) hasMatchedHelmet = true
      else if (aWeight > 20 && hType.includes('Heavy')) hasMatchedHelmet = true
    }
    if (!hasMatchedHelmet) {
      total -= 1 // -1 AC penalty for missing helmet match
    }
  }

  return total
})

// Encumbrance calculations
const encumbranceDetails = computed(() => {
  const wt = totalWeight.value
  const noEnc = strDetails.value.noEnc
  
  // Stages: Non-encumbered, Light, Moderate, Heavy, Severe, Max
  // Let's look up the boundaries based on Strength score in Table 8.23
  // Since we have noEnc and maxW, let's distribute the intermediate brackets linearly or follow the Table 8.23 scaling.
  // Table 8.23 outlines: Non-Enc, Light, Moderate, Heavy, Severe, Max
  // For STR 10-11: Non-Enc 20, Light 32, Mod 41, Heavy 47, Severe 54, Max 65
  // Let's write a lookup based on STR final score.
  const score = finalScores.value.str
  let brackets = [20, 32, 41, 47, 54, 65] // default STR 10-11
  
  if (score <= 3) brackets = [2.5, 5, 7.5, 10, 12.5, 15]
  else if (score === 4) brackets = [5, 10, 15, 20, 25, 30]
  else if (score === 5) brackets = [7.5, 15, 22.5, 27.5, 32.5, 37.5]
  else if (score <= 7) brackets = [10, 20, 27.5, 32.5, 37.5, 45]
  else if (score <= 9) brackets = [17.5, 29, 38, 44, 50, 57.5]
  else if (score <= 11) brackets = [20, 32, 41, 47, 54, 65]
  else if (score <= 13) brackets = [22.5, 35.5, 44, 50, 57.5, 75]
  else if (score <= 15) brackets = [27.5, 41.5, 51.5, 59, 67.5, 85]
  else if (score === 16) brackets = [35, 51, 62, 71, 82.5, 97.5]
  else if (score === 17) brackets = [42.5, 61, 74.5, 87.5, 100, 120]
  else if (score === 18) {
    const pct = exceptionalPercent.value
    if (pct === 0) brackets = [55, 74, 86.5, 100, 112.5, 135]
    else if (pct <= 50) brackets = [67.5, 87.5, 100, 112.5, 127.5, 150]
    else if (pct <= 75) brackets = [80, 100, 112.5, 125, 140, 165]
    else if (pct <= 90) brackets = [92.5, 112.5, 125, 138, 152.5, 180]
    else if (pct <= 99) brackets = [117.5, 135, 147.5, 160, 177.5, 200]
    else brackets = [167.5, 187.5, 200, 215, 232.5, 255]
  }
  else if (score === 19) brackets = [242.5, 262.5, 274, 290, 307.5, 330]
  else if (score === 20) brackets = [267.5, 287.5, 300, 317.5, 335, 360]
  else if (score === 21) brackets = [317.5, 340, 354, 374, 392.5, 415]
  else if (score === 22) brackets = [392.5, 417.5, 432.5, 452.5, 472.5, 500]
  else if (score === 23) brackets = [467.5, 492.5, 509, 529, 549, 575]
  else if (score === 24) brackets = [617.5, 645, 662.5, 685, 710, 740]
  else if (score >= 25) brackets = [767.5, 795, 812.5, 835, 860, 895]

  // Large sized bipeds double the capacity limits
  let sizeMult = 1.0
  if (ANCESTRIES[ancestry.value]?.size === 'Large') {
    sizeMult = 2.0
  }
  
  const limitNon = brackets[0] * sizeMult
  const limitLight = brackets[1] * sizeMult
  const limitMod = brackets[2] * sizeMult
  const limitHeavy = brackets[3] * sizeMult
  const limitSev = brackets[4] * sizeMult
  const limitMax = brackets[5] * sizeMult

  let stage = 'Non-encumbered'
  let penaltyAtk = 0
  let penaltyAC = 0
  let speed = ANCESTRIES[ancestry.value]?.speed || 12

  if (wt <= limitNon) {
    stage = 'Non-encumbered'
  } else if (wt <= limitLight) {
    stage = 'Lightly encumbered'
    speed = speed === 12 ? 11 : speed === 9 ? 8 : 5
  } else if (wt <= limitMod) {
    stage = 'Moderately encumbered'
    speed = speed === 12 ? 9 : speed === 9 ? 7 : 4
    penaltyAtk = -1 // Only at max capacity (we apply it directly for simplification)
  } else if (wt <= limitHeavy) {
    stage = 'Heavily encumbered'
    speed = speed === 12 ? 7 : speed === 9 ? 5 : 3
    penaltyAtk = -2
    penaltyAC = -1
  } else if (wt <= limitSev) {
    stage = 'Severely encumbered'
    speed = speed === 12 ? 5 : speed === 9 ? 3 : 2
    penaltyAtk = -4
    penaltyAC = -3
  } else {
    stage = 'Overwhelmingly encumbered / Overloaded'
    speed = 1
    penaltyAtk = -4
    penaltyAC = -3
  }

  return { stage, penaltyAtk, penaltyAC, speed, limitNon, limitLight, limitMod, limitHeavy, limitSev, limitMax }
})

// --- SKILL POINTS BUDGET ---

const skillPointsMax = computed(() => {
  const primarySP = CLASSES[primaryClass.value]?.sp || 5
  const ageSP = LIFE_STAGES[lifeStage.value]?.sp || 0
  return primarySP + ageSP
})

const skillPointsRemaining = computed(() => {
  let spent = 0
  selectedSkills.value.forEach(sName => {
    const skObj = SKILLS.find(s => s.name === sName)
    if (skObj) {
      // Animal handling is 1 for Rangers and Druids
      if (skObj.name === 'Animal Handling' && (primaryClass.value === 'ranger' || primaryClass.value === 'druid' || secondaryClass.value === 'ranger' || secondaryClass.value === 'druid')) {
        spent += 1
      } else {
        spent += skObj.cost
      }
    }
  })
  return skillPointsMax.value - spent
})

function toggleSkill(sName) {
  const idx = selectedSkills.value.indexOf(sName)
  if (idx > -1) {
    selectedSkills.value.splice(idx, 1)
  } else {
    // Check if enough points remaining
    const skObj = SKILLS.find(s => s.name === sName)
    if (skObj) {
      let cost = skObj.cost
      if (skObj.name === 'Animal Handling' && (primaryClass.value === 'ranger' || primaryClass.value === 'druid' || secondaryClass.value === 'ranger' || secondaryClass.value === 'druid')) {
        cost = 1
      }
      if (skillPointsRemaining.value >= cost) {
        selectedSkills.value.push(sName)
      }
    }
  }
}

// Check if skill is allowed for current classes
function isSkillAllowed(skill) {
  if (skill.req === 'General') return true
  
  const clsGroups = [classGroup.value]
  if (secondaryClass.value) {
    clsGroups.push(secondaryClassGroup.value)
  }
  
  const clsNames = [primaryClass.value]
  if (secondaryClass.value) {
    clsNames.push(secondaryClass.value)
  }

  // Parse skill requirements
  if (skill.req.includes('Rogue') && (clsGroups.includes('rogue'))) return true
  if (skill.req.includes('Warrior') && (clsGroups.includes('warrior'))) return true
  if (skill.req.includes('Priest') && (clsGroups.includes('priest'))) return true
  if (skill.req.includes('Wizard') && (clsGroups.includes('wizard'))) return true
  
  return false
}

// --- SPELLS PER DAY PROGRESSION ---

const spellSlots = computed(() => {
  const getSlots = (cls, lvl) => {
    if (!cls || lvl <= 0) return []
    
    if (cls === 'mage' || cls === 'sorcerer') {
      const mageProg = [
        [], // lvl 0
        [1], // lvl 1
        [2], // lvl 2
        [2, 1], // lvl 3
        [3, 2], // lvl 4
        [4, 2, 1], // lvl 5
        [4, 2, 2], // lvl 6
        [4, 3, 2, 1], // 7
        [4, 3, 3, 2], // 8
        [4, 3, 3, 2, 1], // 9
        [4, 4, 3, 2, 2], // 10
        [4, 4, 4, 3, 3], // 11
        [4, 4, 4, 4, 4, 1], // 12
        [5, 5, 5, 4, 4, 2], // 13
        [5, 5, 5, 4, 4, 2, 1], // 14
        [5, 5, 5, 5, 5, 2, 1], // 15
        [5, 5, 5, 5, 5, 3, 2, 1], // 16
        [5, 5, 5, 5, 5, 3, 3, 2], // 17
        [5, 5, 5, 5, 5, 3, 3, 2, 1], // 18
        [5, 5, 5, 5, 5, 3, 3, 3, 1], // 19
        [5, 5, 5, 5, 5, 4, 3, 3, 2], // 20
      ]
      return mageProg[Math.min(lvl, 20)] || []
    }
    
    if (cls === 'cleric' || cls === 'druid') {
      const priestProg = [
        [], // lvl 0
        [1], // lvl 1
        [2], // lvl 2
        [2, 1], // lvl 3
        [3, 2], // lvl 4
        [3, 3, 1], // lvl 5
        [3, 3, 2], // 6
        [3, 3, 2, 1], // 7
        [3, 3, 3, 2], // 8
        [4, 4, 3, 2, 1], // 9
        [4, 4, 3, 3, 2], // 10
        [5, 4, 4, 3, 2, 1], // 11
        [6, 5, 5, 3, 2, 2], // 12
        [6, 6, 6, 4, 2, 2], // 13
        [6, 6, 6, 5, 3, 2, 1], // 14
        [6, 6, 6, 6, 4, 2, 1], // 15
        [7, 7, 7, 6, 4, 3, 1], // 16
        [7, 7, 7, 7, 5, 3, 2], // 17
        [8, 8, 8, 8, 6, 4, 2], // 18
        [9, 9, 8, 8, 6, 4, 2], // 19
        [9, 9, 9, 8, 7, 5, 2], // 20
      ]
      
      const baseSlots = [...(priestProg[Math.min(lvl, 20)] || [])]
      
      // Add WIS bonus spell slots
      const wisBonus = wisDetails.value.bonus
      if (wisBonus !== '—') {
        const bonusLevels = wisBonus.split(',').map(s => parseInt(s.trim(), 10))
        bonusLevels.forEach(bLvl => {
          if (bLvl <= baseSlots.length) {
            baseSlots[bLvl - 1]++
          } else if (bLvl === baseSlots.length + 1) {
            // Can only receive bonus slots if class level allows casting that spell level
            // Standard rule: cannot get bonus slots for levels you cannot cast yet.
          }
        })
      }
      return baseSlots
    }
    
    if (cls === 'bard') {
      const bardProg = [
        [], // lvl 0
        [0], // lvl 1
        [1], // lvl 2
        [2], // lvl 3
        [2, 1], // lvl 4
        [3, 1], // lvl 5
        [3, 2], // 6
        [3, 2, 1], // 7
        [4, 2, 1], // 8
        [4, 3, 2], // 9
        [4, 3, 2, 1], // 10
        [4, 4, 3, 1], // 11
        [4, 4, 3, 2], // 12
        [4, 4, 4, 2, 1], // 13
        [4, 4, 4, 3, 1], // 14
        [4, 4, 4, 3, 2], // 15
        [4, 4, 4, 4, 2, 1], // 16
        [5, 4, 4, 4, 3, 1], // 17
        [5, 5, 4, 4, 3, 2], // 18
        [5, 5, 5, 4, 3, 3], // 19
        [5, 5, 5, 5, 4, 3], // 20
      ]
      return bardProg[Math.min(lvl, 20)] || []
    }
    
    if (cls === 'paladin' || cls === 'ranger') {
      if (lvl < 9) return []
      const palProg = [
        [],[],[],[],[],[],[],[],[], // 0-8
        [1], // 9
        [2], // 10
        [2, 1], // 11
        [2, 2], // 12
        [2, 2, 1], // 13
        [3, 2, 1], // 14
        [3, 2, 1, 1], // 15
        [3, 3, 2, 1], // 16
        [3, 3, 3, 1], // 17
        [3, 3, 3, 2], // 18
        [3, 3, 3, 3], // 19
        [3, 3, 3, 3]  // 20
      ]
      return palProg[Math.min(lvl, 20)] || []
    }
    return []
  }

  const pSlots = getSlots(primaryClass.value, levelPrimary.value)
  const sSlots = secondaryClass.value ? getSlots(secondaryClass.value, levelSecondary.value) : []

  return { primary: pSlots, secondary: sSlots }
})

// Filter spells from database
const filteredSpells = computed(() => {
  const list = []
  
  // Decide which spells to show
  // If primary or secondary class is Mage, Sorcerer, or Bard, show Wizard Spells
  // If primary or secondary is Cleric, Druid, Ranger (Warden), Paladin, show Priest Spells
  const hasArcane = isWizard.value || primaryClass.value === 'bard' || secondaryClass.value === 'bard'
  const hasDivine = isPriest.value || primaryClass.value === 'paladin' || secondaryClass.value === 'paladin' || primaryClass.value === 'ranger' || secondaryClass.value === 'ranger'

  spellsData.forEach(sp => {
    if (sp.type === 'wizard' && hasArcane) {
      list.push(sp)
    } else if (sp.type === 'priest' && hasDivine) {
      list.push(sp)
    }
  })
  
  return list
})

function toggleSpell(spell) {
  const idx = selectedSpells.value.findIndex(s => s.name === spell.name)
  if (idx > -1) {
    selectedSpells.value.splice(idx, 1)
  } else {
    selectedSpells.value.push(spell)
  }
}

// --- EXPORT HANDLERS ---

// Roll point buy scores or other methods
function setRollMethod(method) {
  rollMethod.value = method
  if (method === 'pointbuy') {
    scoresRaw.value = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    pointBuyBalance.value = 30
  } else if (method === 'standard') {
    // Method I: Roll 4d6 discard lowest six times
    const rolls = []
    for (let i = 0; i < 6; i++) {
      const d = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1)
      d.sort()
      rolls.push(d[1] + d[2] + d[3])
    }
    rolledValues.value = rolls
    scoresRaw.value = { str: rolls[0], dex: rolls[1], con: rolls[2], int: rolls[3], wis: rolls[4], cha: rolls[5] }
  } else if (method === 'traditional') {
    // Method II: 3d6 six times in order
    scoresRaw.value = {
      str: roll3d6(),
      dex: roll3d6(),
      con: roll3d6(),
      int: roll3d6(),
      wis: roll3d6(),
      cha: roll3d6()
    }
  } else if (method === 'flexible') {
    // Method III: 3d6 rolled 12 times, pick 6
    const rolls = Array.from({ length: 12 }, () => roll3d6())
    rolls.sort((a, b) => b - a) // sort descending
    rolledValues.value = rolls.slice(0, 6)
    scoresRaw.value = {
      str: rolls[0],
      dex: rolls[1],
      con: rolls[2],
      int: rolls[3],
      wis: rolls[4],
      cha: rolls[5]
    }
  }
}

function roll3d6() {
  return (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1)
}

function adjustPointBuy(stat, amt) {
  const current = scoresRaw.value[stat]
  const target = current + amt
  if (target < 3 || target > 18) return

  // Calculate cost of the adjustment
  // Up to 15: 1 pt. 16: 2 pt. 17: 3 pt. 18: 4 pt.
  const getScoreCost = (score) => {
    let cost = 0
    for (let i = 9; i <= score; i++) {
      if (i <= 15) cost += 1
      else if (i === 16) cost += 2
      else if (i === 17) cost += 3
      else if (i === 18) cost += 4
    }
    return cost
  }

  const currentCost = getScoreCost(current)
  const targetCost = getScoreCost(target)
  const costDiff = targetCost - currentCost

  if (pointBuyBalance.value >= costDiff) {
    scoresRaw.value[stat] = target
    pointBuyBalance.value -= costDiff
  }
}

// Generate starting gold
function rollStartingGold() {
  const grp = classGroup.value
  const set = STARTING_MONEY[grp]
  let total = 0
  if (grp === 'warrior') {
    // 5d4 * 10
    total = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4) + 1).reduce((a, b) => a + b) * 10
  } else if (grp === 'wizard') {
    // (1d4 + 1) * 10
    total = (Math.floor(Math.random() * 4) + 2) * 10
  } else if (grp === 'rogue') {
    // 2d6 * 10
    total = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1).reduce((a, b) => a + b) * 10
  } else if (grp === 'priest') {
    // 3d6 * 10
    total = Array.from({ length: 3 }, () => Math.floor(Math.random() * 6) + 1).reduce((a, b) => a + b) * 10
  }
  goldPieces.value = total
}

// EXPORT TO FOUNDRY VTT JSON FORMAT
function exportJSON() {
  const charData = getCharacterJSON()
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(charData, null, 2))
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `${characterName.value.replace(/\s+/g, '_')}_SD_sheet.json`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

function getCharacterJSON() {
  return {
    name: characterName.value,
    type: 'character',
    img: 'icons/svg/citizen.svg',
    system: {
      details: {
        player: playerName.value,
        alignment: alignment.value,
        ancestry: ancestry.value,
        primaryClass: primaryClass.value,
        secondaryClass: secondaryClass.value,
        levelPrimary: levelPrimary.value,
        levelSecondary: levelSecondary.value,
        homeland: homeland.value,
        religion: religion.value,
        age: startingAge.value,
        lifeStage: lifeStage.value,
        mageSpecialistSchool: mageSpecialistSchool.value,
        sorcererPatron: sorcererPatron.value,
        priestDeity: priestDeity.value
      },
      abilities: {
        str: { value: finalScores.value.str, raw: scoresRaw.value.str, exceptional: exceptionalPercent.value },
        dex: { value: finalScores.value.dex, raw: scoresRaw.value.dex },
        con: { value: finalScores.value.con, raw: scoresRaw.value.con },
        int: { value: finalScores.value.int, raw: scoresRaw.value.int },
        wis: { value: finalScores.value.wis, raw: scoresRaw.value.wis },
        cha: { value: finalScores.value.cha, raw: scoresRaw.value.cha }
      },
      attributes: {
        hp: { value: hpMaximum.value, max: hpMaximum.value },
        ac: { value: armorClass.value },
        speed: { value: encumbranceDetails.value.speed },
        init: 10 + Math.max(-6, Math.min(6, dexDetails.value.surprise)) // Default initiative modifier
      },
      saves: {
        fortitude: { value: saves.value.fort },
        reflex: { value: saves.value.ref },
        will: { value: saves.value.will }
      },
      skills: selectedSkills.value,
      thieving: thievingSkillsPoints.value,
      spells: selectedSpells.value.map(s => s.name),
      inventory: inventory.value,
      currency: {
        gp: goldPieces.value,
        sp: goldTreasures.value.sp,
        cp: goldTreasures.value.cp,
        gems: goldTreasures.value.gems
      }
    }
  }
}

// IMPORT JSON FORMAT
function importJSON(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result)
      if (parsed.type !== 'character') {
        importError.value = 'Invalid JSON: Not an S&D character sheet.'
        return
      }

      const sys = parsed.system
      const det = sys.details
      characterName.value = parsed.name
      playerName.value = det.player || ''
      alignment.value = det.alignment || 'Neutral'
      ancestry.value = det.ancestry || 'human'
      primaryClass.value = det.primaryClass || 'fighter'
      secondaryClass.value = det.secondaryClass || ''
      levelPrimary.value = det.levelPrimary || 1
      levelSecondary.value = det.levelSecondary || 0
      homeland.value = det.homeland || ''
      religion.value = det.religion || ''
      startingAge.value = det.age || 20
      lifeStage.value = det.lifeStage || 'adult'
      mageSpecialistSchool.value = det.mageSpecialistSchool || ''
      sorcererPatron.value = det.sorcererPatron || ''
      priestDeity.value = det.priestDeity || ''

      const ab = sys.abilities
      scoresRaw.value = {
        str: ab.str.raw || 10,
        dex: ab.dex.raw || 10,
        con: ab.con.raw || 10,
        int: ab.int.raw || 10,
        wis: ab.wis.raw || 10,
        cha: ab.cha.raw || 10
      }
      exceptionalPercent.value = ab.str.exceptional || 0

      selectedSkills.value = sys.skills || []
      if (sys.thieving) thievingSkillsPoints.value = sys.thieving
      inventory.value = sys.inventory || []
      
      const cur = sys.currency || {}
      goldPieces.value = cur.gp || 0
      goldTreasures.value.sp = cur.sp || 0
      goldTreasures.value.cp = cur.cp || 0
      goldTreasures.value.gems = cur.gems || ''

      // Spells lookup
      if (sys.spells) {
        selectedSpells.value = spellsData.filter(s => sys.spells.includes(s.name))
      }

      importError.value = ''
      alert('Character loaded successfully!')
    } catch (err) {
      importError.value = 'Failed to parse JSON file: ' + err.message
    }
  }
  reader.readAsText(file)
}

// EXPORT TO MARKDOWN
function exportMarkdown() {
  const md = getCharacterMarkdown()
  navigator.clipboard.writeText(md).then(() => {
    alert('Character sheet markdown copied to clipboard!')
  }).catch(() => {
    // Fallback download
    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${characterName.value.replace(/\s+/g, '_')}_SD.md`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  })
}

function getCharacterMarkdown() {
  const invList = inventory.value.map(i => `- ${i.name} (x${i.qty})${i.equipped ? ' [Equipped]' : ''} - Load: ${i.weight * i.qty} kg`).join('\n')
  const skList = selectedSkills.value.map(s => `- ${s}`).join('\n')
  const spList = selectedSpells.value.map(s => `- **${s.name}** (${s.school}, Level ${s.level})`).join('\n')
  
  return `# Swords & Darkness Character: ${characterName.value}
**Player:** ${playerName.value || '—'} | **Ancestry:** ${ANCESTRIES[ancestry.value].name} | **Class:** ${levelText.value}
**Homeland:** ${homeland.value || '—'} | **Religion:** ${religion.value || '—'} | **Alignment:** ${alignment.value}

## ABILITIES
- **STR:** ${finalScores.value.str}${exceptionalPercent.value > 0 ? ` (18/${exceptionalPercent.value})` : ''} [Atk Mod: ${strDetails.value.atk > 0 ? `+${strDetails.value.atk}` : strDetails.value.atk}, Dmg Mod: ${strDetails.value.dmg > 0 ? `+${strDetails.value.dmg}` : strDetails.value.dmg}]
- **DEX:** ${finalScores.value.dex} [Surprise: ${dexDetails.value.surprise > 0 ? `+${dexDetails.value.surprise}` : dexDetails.value.surprise}, AC Mod: ${dexDetails.value.acMod > 0 ? `+${dexDetails.value.acMod}` : dexDetails.value.acMod}]
- **CON:** ${finalScores.value.con} [HP Mod: ${conDetails.value.hp > 0 ? `+${conDetails.value.hp}` : conDetails.value.hp}, Shock: ${conDetails.value.shock}, Resurrection: ${conDetails.value.res}]
- **INT:** ${finalScores.value.int} [Lang limit: ${intDetails.value.lang}, Max spell level: ${intDetails.value.maxLvl}, Learn spell: ${intDetails.value.learn}]
- **WIS:** ${finalScores.value.wis} [Mental Defense: ${wisDetails.value.def > 0 ? `+${wisDetails.value.def}` : wisDetails.value.def}]
- **CHA:** ${finalScores.value.cha} [Henchmen: ${chaDetails.value.hench}, Loyalty Mod: ${loyaltyModText.value}, Reaction Mod: ${reactionModText.value}]

## COMBAT & DEFENSE
- **Hit Points (Max):** ${hpMaximum.value}
- **Armor Class:** ${armorClass.value} (Equipped: ${equippedArmor.value?.name || 'Unarmored'} ${equippedShield.value ? `+ Shield (${equippedShield.value.name})` : ''})
- **Movement Speed:** ${encumbranceDetails.value.speed}
- **Attack Bonus:** +${attackBonus.value}
- **Encumbrance Stage:** ${encumbranceDetails.value.stage} (Total Weight: ${totalWeight.value} / ${encumbranceDetails.value.limitMax} kg)

## SAVING THROWS
- **Fortitude (CON):** ${saves.value.fort}
- **Reflex (DEX):** ${saves.value.ref}
- **Will (WIS):** ${saves.value.will}

## SKILLS
${skList || 'No skills selected.'}

## EQUIPMENT
${invList || 'No equipment.'}
- **Gold Pieces:** ${goldPieces.value} gp | ${goldTreasures.value.sp} sp | ${goldTreasures.value.cp} cp
- **Gems/Jewels:** ${goldTreasures.value.gems || 'None'}

## SPELLS
${spList || 'No spells selected.'}
`
}

// EXPORT TO CSV
function exportCSV() {
  let csvContent = 'data:text/csv;charset=utf-8,'
  csvContent += 'Field,Value\n'
  csvContent += `Character Name,"${characterName.value}"\n`
  csvContent += `Player,"${playerName.value}"\n`
  csvContent += `Ancestry,"${ANCESTRIES[ancestry.value].name}"\n`
  csvContent += `Class,"${levelText.value}"\n`
  csvContent += `HP,${hpMaximum.value}\n`
  csvContent += `AC,${armorClass.value}\n`
  csvContent += `STR,${finalScores.value.str}\n`
  csvContent += `DEX,${finalScores.value.dex}\n`
  csvContent += `CON,${finalScores.value.con}\n`
  csvContent += `INT,${finalScores.value.int}\n`
  csvContent += `WIS, finalScores.value.wis\n`
  csvContent += `CHA,${finalScores.value.cha}\n`
  csvContent += `Fortitude Save,${saves.value.fort}\n`
  csvContent += `Reflex Save,${saves.value.ref}\n`
  csvContent += `Will Save,${saves.value.will}\n`
  
  const dataStr = encodeURI(csvContent)
  const downloadAnchor = document.createElement('a')
  downloadAnchor.setAttribute('href', dataStr)
  downloadAnchor.setAttribute('download', `${characterName.value.replace(/\s+/g, '_')}_SD.csv`)
  document.body.appendChild(downloadAnchor)
  downloadAnchor.click()
  downloadAnchor.remove()
}

// PRINT TRIGGER (PDF GENERATION via browser print dialog)
function printSheet() {
  window.print()
}

// Check validation issues
const validationErrors = computed(() => {
  const errors = []
  if (!ancestryCheckResult.value.valid) {
    errors.push(...ancestryCheckResult.value.errors)
  }
  if (!classCheckResult.value.valid) {
    errors.push(...classCheckResult.value.errors)
  }
  if (skillPointsRemaining.value < 0) {
    errors.push(`Skill point deficit: Spent ${skillPointsMax.value - skillPointsRemaining.value}/${skillPointsMax.value} SP.`)
  }
  return errors
})
</script>

<template>
  <div class="character-builder-wrapper">
    <!-- Builder Controls Panel (hidden in print) -->
    <div class="builder-panel no-print">
      <header class="builder-header">
        <h1 class="cinzel-title">Swords & Darkness Character Builder</h1>
        <p class="subtitle font-serif">Create and customize characters according to the Open Game License 2nd Edition rules.</p>
      </header>

      <!-- Import and Validation Banner -->
      <div class="action-banner">
        <div class="file-io">
          <label class="btn-action file-label">
            Import JSON
            <input type="file" @change="importJSON" accept=".json" style="display: none;" />
          </label>
          <button @click="exportJSON" class="btn-action">Export JSON (Foundry VTT)</button>
          <button @click="exportMarkdown" class="btn-action">Export Markdown</button>
          <button @click="exportCSV" class="btn-action">Export CSV</button>
          <button @click="printSheet" class="btn-action btn-highlight">Print/Save PDF</button>
        </div>
        <p v-if="importError" class="error-msg font-serif">{{ importError }}</p>
        
        <!-- Validation Warning Box -->
        <div v-if="validationErrors.length > 0" class="validation-warning">
          <span class="warning-title font-sans">⚠️ Rule Validation Warnings:</span>
          <ul>
            <li v-for="(err, idx) in validationErrors" :key="idx" class="font-serif">{{ err }}</li>
          </ul>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="builder-nav">
        <button @click="activeTab = 'core'" :class="{ active: activeTab === 'core' }" class="nav-tab">1. Identity & Stats</button>
        <button @click="activeTab = 'class'" :class="{ active: activeTab === 'class' }" class="nav-tab">2. Class & Levels</button>
        <button @click="activeTab = 'skills'" :class="{ active: activeTab === 'skills' }" class="nav-tab">3. Skills ({{ skillPointsRemaining }} SP)</button>
        <button @click="activeTab = 'gear'" :class="{ active: activeTab === 'gear' }" class="nav-tab">4. Equipment & Load</button>
        <button @click="activeTab = 'spells'" :class="{ active: activeTab === 'spells' }" class="nav-tab">5. Spells</button>
        <button @click="activeTab = 'preview'" :class="{ active: activeTab === 'preview' }" class="nav-tab nav-tab-highlight">6. Character Sheet</button>
      </nav>

      <!-- TAB 1: CORE IDENTITY & STATS -->
      <div v-if="activeTab === 'core'" class="tab-content">
        <div class="grid-2">
          <!-- Bio block -->
          <div class="form-card">
            <h3 class="card-title">Identity</h3>
            <div class="form-group">
              <label>Character Name</label>
              <input type="text" v-model="characterName" />
            </div>
            <div class="form-group">
              <label>Player Name</label>
              <input type="text" v-model="playerName" />
            </div>
            <div class="form-group">
              <label>Homeland</label>
              <input type="text" v-model="homeland" />
            </div>
            <div class="form-group">
              <label>Religion / Deity</label>
              <input type="text" v-model="religion" />
            </div>
            <div class="form-group">
              <label>Alignment</label>
              <select v-model="alignment">
                <option>Lawful Good</option>
                <option>Neutral Good</option>
                <option>Chaotic Good</option>
                <option>Lawful Neutral</option>
                <option>Neutral</option>
                <option>Chaotic Neutral</option>
                <option>Lawful Evil</option>
                <option>Neutral Evil</option>
                <option>Chaotic Evil</option>
              </select>
            </div>
            <div class="form-group grid-2-sub">
              <div>
                <label>Starting Age</label>
                <input type="number" v-model="startingAge" />
              </div>
              <div>
                <label>Life Stage</label>
                <select v-model="lifeStage">
                  <option value="adult">Adult</option>
                  <option value="middle">Middle Age</option>
                  <option value="old">Old Age</option>
                  <option value="venerable">Venerable</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Ancestry configuration -->
          <div class="form-card">
            <h3 class="card-title">Ancestry</h3>
            <div class="form-group">
              <label>Select Ancestry</label>
              <select v-model="ancestry">
                <option v-for="(v, k) in ANCESTRIES" :key="k" :value="k">{{ v.name }}</option>
              </select>
            </div>
            
            <div class="ancestry-details font-serif">
              <p><strong>Size:</strong> {{ ANCESTRIES[ancestry].size }}</p>
              <p><strong>Movement Speed:</strong> {{ ANCESTRIES[ancestry].speed }} m</p>
              <p><strong>Racial Score Adjustments:</strong> 
                <span v-if="Object.keys(ANCESTRIES[ancestry].adj).length === 0">None</span>
                <span v-else v-for="(val, stat) in ANCESTRIES[ancestry].adj" :key="stat">
                  {{ stat.toUpperCase() }} {{ val > 0 ? `+${val}` : val }} &nbsp;
                </span>
              </p>
              <p><strong>Racial Traits:</strong></p>
              <ul>
                <li v-for="t in ANCESTRIES[ancestry].traits" :key="t">{{ t }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Ability score rollers -->
        <div class="form-card mt-2">
          <h3 class="card-title">Ability Scores Generation</h3>
          <div class="roller-tabs">
            <button @click="setRollMethod('pointbuy')" :class="{ active: rollMethod === 'pointbuy' }" class="btn-sub">Method IV: Point Buy</button>
            <button @click="setRollMethod('standard')" :class="{ active: rollMethod === 'standard' }" class="btn-sub">Method I: 4d6 Drop Lowest</button>
            <button @click="setRollMethod('traditional')" :class="{ active: rollMethod === 'traditional' }" class="btn-sub">Method II: 3d6 In-Order</button>
            <button @click="setRollMethod('flexible')" :class="{ active: rollMethod === 'flexible' }" class="btn-sub">Method III: 3d6 Twelve Times</button>
            <button @click="rollMethod = 'manual'" :class="{ active: rollMethod === 'manual' }" class="btn-sub">Manual Entry / Custom</button>
          </div>

          <div v-if="rollMethod === 'pointbuy'" class="pointbuy-banner">
            <span class="badge">Remaining Points: {{ pointBuyBalance }}</span>
            <p class="font-serif font-sm">Start at 8, distribute 30 points. Cost increases above 15 (15->16 costs 2, 16->17 costs 3, 17->18 costs 4).</p>
          </div>
          <div v-if="['standard', 'flexible'].includes(rollMethod)" class="rolled-banner">
            <p class="font-serif">Rolled Scores: &nbsp; <span v-for="r in rolledValues" :key="r" class="badge badge-sub">{{ r }}</span></p>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div v-for="stat in ['str', 'dex', 'con', 'int', 'wis', 'cha']" :key="stat" class="stat-control">
              <span class="stat-name font-sans">{{ stat.toUpperCase() }}</span>
              
              <!-- Custom modifiers based on point buy / input -->
              <div class="score-adjust">
                <button v-if="rollMethod === 'pointbuy'" @click="adjustPointBuy(stat, -1)" class="btn-adjust">-</button>
                <input v-if="rollMethod === 'manual'" type="number" v-model="scoresRaw[stat]" class="stat-input" />
                <span v-else class="stat-value">{{ scoresRaw[stat] }}</span>
                <button v-if="rollMethod === 'pointbuy'" @click="adjustPointBuy(stat, 1)" class="btn-adjust">+</button>
              </div>

              <!-- Raw & Adjusted values display -->
              <div class="stat-displays font-serif">
                <span>Raw: {{ scoresRaw[stat] }}</span>
                <span>Final: <strong>{{ finalScores[stat] }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Exceptional Strength Percentile Roll -->
          <div v-if="finalScores.str === 18 && isWarrior" class="exceptional-strength-card form-group mt-1">
            <label>Exceptional Strength Percentile (d%)</label>
            <input type="number" v-model="exceptionalPercent" min="0" max="100" />
            <p class="font-serif font-sm">Warrior classes whose Strength reaches 18 roll a percentile (18/01 to 18/00 (100)) to determine extended Strength values.</p>
          </div>
        </div>

        <!-- Ability Score Modifiers Tables -->
        <div class="grid-3 mt-2">
          <div class="form-card modifier-card font-serif">
            <h4 class="card-subtitle">Strength Outputs</h4>
            <ul>
              <li>Melee Attack Bonus: {{ strDetails.atk >= 0 ? `+${strDetails.atk}` : strDetails.atk }}</li>
              <li>Damage Bonus: {{ strDetails.dmg >= 0 ? `+${strDetails.dmg}` : strDetails.dmg }}</li>
              <li>No-Encumbrance Load: {{ strDetails.noEnc }} kg</li>
              <li>Maximum Carrying Weight: {{ strDetails.maxW }} kg</li>
              <li>Force Doors: {{ strDetails.force }}/20</li>
              <li>Bend Bars / Lift Portcullis: {{ strDetails.bend }}%</li>
            </ul>
          </div>
          <div class="form-card modifier-card font-serif">
            <h4 class="card-subtitle">Dexterity & Constitution</h4>
            <ul>
              <li>Surprise Mod (Reflex Save): {{ dexDetails.surprise >= 0 ? `+${dexDetails.surprise}` : dexDetails.surprise }}</li>
              <li>Missile Attack Modifier: {{ dexDetails.missile >= 0 ? `+${dexDetails.missile}` : dexDetails.missile }}</li>
              <li>AC Modifier: {{ dexDetails.acMod >= 0 ? `+${dexDetails.acMod}` : dexDetails.acMod }}</li>
              <li>Constitution HP Modifier: {{ conDetails.hp >= 0 ? `+${conDetails.hp}` : conDetails.hp }}</li>
              <li>System Shock survival: {{ conDetails.shock }}</li>
              <li>Resurrection survival: {{ conDetails.res }}</li>
            </ul>
          </div>
          <div class="form-card modifier-card font-serif">
            <h4 class="card-subtitle">Intelligence & Wisdom</h4>
            <ul>
              <li>Bonus Languages Limit: {{ intDetails.lang }}</li>
              <li>Max Spell Level: {{ intDetails.maxLvl }}</li>
              <li>Max Spells per Level: {{ intDetails.maxSp }}</li>
              <li>Spell Failure Rate: {{ wisDetails.fail }}</li>
              <li>Will Save mental modifier: {{ wisDetails.def >= 0 ? `+${wisDetails.def}` : wisDetails.def }}</li>
              <li>Priest Bonus Spells: {{ wisDetails.bonus }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TAB 2: CLASS & LEVEL CONFIGURATION -->
      <div v-if="activeTab === 'class'" class="tab-content">
        <div class="grid-2">
          <!-- Class choice -->
          <div class="form-card">
            <h3 class="card-title">Class Selection</h3>
            <div class="form-group">
              <label>Primary Class</label>
              <select v-model="primaryClass">
                <option v-for="(v, k) in CLASSES" :key="k" :value="k">{{ v.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Level (Primary)</label>
              <input type="range" v-model="levelPrimary" min="1" max="20" class="slider" />
              <span class="badge">{{ levelPrimary }}</span>
            </div>

            <!-- Multiclass options -->
            <div class="form-group">
              <label>Secondary Class (Multiclass)</label>
              <select v-model="secondaryClass">
                <option value="">None</option>
                <option v-for="(v, k) in CLASSES" :key="k" :value="k">{{ v.name }}</option>
              </select>
            </div>
            <div v-if="secondaryClass" class="form-group">
              <label>Level (Secondary)</label>
              <input type="range" v-model="levelSecondary" min="1" max="20" class="slider" />
              <span class="badge">{{ levelSecondary }}</span>
            </div>
          </div>

          <!-- Class requirements, HP and saving throws calculation preview -->
          <div class="form-card font-serif">
            <h3 class="card-title">Class Features & Stats</h3>
            <p><strong>Primary Class Group:</strong> {{ classGroup.toUpperCase() }}</p>
            <p><strong>Weapon & Armor Permitted:</strong> {{ CLASSES[primaryClass].weaponArmor }}</p>
            <p><strong>Class features:</strong></p>
            <ul>
              <li v-for="f in CLASSES[primaryClass].features" :key="f">{{ f }}</li>
            </ul>
            
            <div v-if="secondaryClass" class="mt-1">
              <p><strong>Secondary Class Group:</strong> {{ secondaryClassGroup.toUpperCase() }}</p>
              <p><strong>Secondary Weapon/Armor:</strong> {{ CLASSES[secondaryClass].weaponArmor }}</p>
              <ul>
                <li v-for="f in CLASSES[secondaryClass].features" :key="f">{{ f }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="grid-3 mt-2 font-sans">
          <!-- HP and Saves Preview -->
          <div class="form-card highlight-card">
            <span class="highlight-title">HIT POINTS</span>
            <div class="hp-control">
              <input type="number" v-model="hpInput" :placeholder="hpMaximum" class="hp-input-field" />
              <span class="hp-subtitle font-serif">Enter custom value or leave blank to use the calculated average ({{ hpMaximum }} HP)</span>
            </div>
          </div>

          <div class="form-card highlight-card">
            <span class="highlight-title">ATTACK BONUS</span>
            <span class="highlight-value">+{{ attackBonus }}</span>
            <span class="highlight-subtitle font-serif">Derived from the highest Attack Bonus progression.</span>
          </div>

          <div class="form-card highlight-card">
            <span class="highlight-title">SAVING THROWS</span>
            <div class="saves-flex font-serif">
              <div>
                <span>Fortitude (CON)</span>
                <strong class="save-val">{{ saves.fort }}</strong>
              </div>
              <div>
                <span>Reflex (DEX)</span>
                <strong class="save-val">{{ saves.ref }}</strong>
              </div>
              <div>
                <span>Will (WIS)</span>
                <strong class="save-val">{{ saves.will }}</strong>
              </div>
            </div>
            <span class="highlight-subtitle font-serif">Roll equal to or under this score on 1d20 to succeed. Includes Paladin bonus & ability mods.</span>
          </div>
        </div>
      </div>

      <!-- TAB 3: SKILL POINT ALLOCATION -->
      <div v-if="activeTab === 'skills'" class="tab-content">
        <div class="form-card">
          <h3 class="card-title">Non-Combat Skills Selection</h3>
          <div class="skills-banner">
            <span class="badge">Remaining Skill Points: {{ skillPointsRemaining }} / {{ skillPointsMax }}</span>
            <p class="font-serif font-sm">Skills cost 1, 2, or 3 points. Specialized skills (marked with ◆) cannot be attempted untrained.</p>
          </div>

          <!-- Skills Table Layout -->
          <div class="skills-container font-serif">
            <div class="skill-category-block">
              <h4 class="skill-cat-title font-sans">Skills List</h4>
              <div class="skill-list-grid">
                <div v-for="skill in SKILLS" :key="skill.name" 
                     :class="{ 
                       selected: selectedSkills.includes(skill.name),
                       disabled: !isSkillAllowed(skill) 
                     }" 
                     @click="isSkillAllowed(skill) && toggleSkill(skill.name)"
                     class="skill-item">
                  <div class="skill-main">
                    <span class="skill-check">
                      <input type="checkbox" :checked="selectedSkills.includes(skill.name)" :disabled="!isSkillAllowed(skill)" />
                    </span>
                    <span class="skill-name">
                      {{ skill.name }} {{ skill.trainedOnly ? '◆' : '' }}
                    </span>
                  </div>
                  <div class="skill-meta font-sans">
                    <span>Cost: {{ skill.name === 'Animal Handling' && (primaryClass === 'ranger' || primaryClass === 'druid' || secondaryClass === 'ranger' || secondaryClass === 'druid') ? 1 : skill.cost }} SP</span>
                    <span>Attr: {{ skill.attr.toUpperCase() }}</span>
                    <span>Check Target: {{ skill.attr === 'none' ? '—' : finalScores[skill.attr] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thieving Skills percentages for Thieves and Bards -->
        <div v-if="isRogue" class="form-card mt-2">
          <h3 class="card-title">Thief Skills Percentage Adjustments</h3>
          <p class="font-serif font-sm">As a Rogue, you have specialized professional skills. Distribute your class-allocated percentage points here.</p>
          <div class="thieving-grid font-sans">
            <div v-for="(val, skillKey) in thievingSkillsPoints" :key="skillKey" class="form-group">
              <label>{{ skillKey.replace(/([A-Z])/g, ' $1').toUpperCase() }} (%)</label>
              <input type="number" v-model="thievingSkillsPoints[skillKey]" class="thieving-input" />
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: EQUIPMENT, SHOP, AND ENCUMBRANCE -->
      <div v-if="activeTab === 'gear'" class="tab-content">
        <div class="grid-3">
          <!-- Gold and Shop Roller -->
          <div class="form-card">
            <h3 class="card-title">Gold & Resources</h3>
            <div class="form-group">
              <label>Gold Pieces (GP)</label>
              <input type="number" v-model="goldPieces" />
              <button @click="rollStartingGold" class="btn-sub mt-05">Roll Starting Gold</button>
            </div>
            <div class="form-group grid-2-sub">
              <div>
                <label>Silver (SP)</label>
                <input type="number" v-model="goldTreasures.sp" />
              </div>
              <div>
                <label>Copper (CP)</label>
                <input type="number" v-model="goldTreasures.cp" />
              </div>
            </div>
            <div class="form-group">
              <label>Gems / Jewels</label>
              <input type="text" v-model="goldTreasures.gems" placeholder="e.g. 2 x Rubies (50gp each)" />
            </div>
            <div class="form-group grid-2-sub">
              <div>
                <label>Water/Wine (Units)</label>
                <input type="number" v-model="supplies.water" />
              </div>
              <div>
                <label>Rations (Units)</label>
                <input type="number" v-model="supplies.rations" />
              </div>
            </div>
          </div>

          <!-- Inventory list -->
          <div class="form-card col-span-2">
            <h3 class="card-title">Inventory & Load</h3>
            <div class="encumbrance-summary font-sans">
              <span class="badge font-md">Stage: {{ encumbranceDetails.stage }}</span>
              <span>Weight: <strong>{{ totalWeight }}</strong> / {{ encumbranceDetails.limitMax }} kg</span>
              <span>Movement Speed: <strong>{{ encumbranceDetails.speed }}</strong> m/round</span>
            </div>

            <!-- List items -->
            <table class="inventory-table font-serif">
              <thead>
                <tr class="font-sans">
                  <th>Item</th>
                  <th width="80">Qty</th>
                  <th width="80">Weight</th>
                  <th width="100">Equip</th>
                  <th width="60">Del</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in inventory" :key="idx">
                  <td>{{ item.name }}</td>
                  <td>{{ item.qty }}</td>
                  <td>{{ item.weight * item.qty }} kg</td>
                  <td>
                    <button @click="toggleEquipItem(idx)" :class="{ active: item.equipped }" class="btn-sub btn-tiny">
                      {{ item.equipped ? 'Equipped' : 'Equip' }}
                    </button>
                  </td>
                  <td>
                    <button @click="removeItemFromInventory(idx)" class="btn-sub btn-tiny danger">X</button>
                  </td>
                </tr>
                <tr v-if="inventory.length === 0">
                  <td colspan="5" class="empty-inventory font-serif">Inventory is empty. Add equipment from the shop below.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shop List panel -->
        <div class="form-card mt-2">
          <h3 class="card-title">Equipment Shop</h3>
          
          <div class="shop-grid font-sans">
            <!-- Weapons -->
            <div class="shop-column">
              <h4 class="card-subtitle">Weapons</h4>
              <div class="shop-items font-serif">
                <div v-for="w in WEAPONS" :key="w.name" class="shop-item-row">
                  <span>{{ w.name }} ({{ w.cost }} gp, {{ w.weight }} kg)</span>
                  <button @click="addItemToInventory(w)" class="btn-sub btn-tiny">+</button>
                </div>
              </div>
            </div>

            <!-- Armor -->
            <div class="shop-column">
              <h4 class="card-subtitle">Armor</h4>
              <div class="shop-items font-serif">
                <div v-for="a in ARMOR" :key="a.name" class="shop-item-row">
                  <span>{{ a.name }} ({{ a.cost }} gp, AC {{ a.ac }})</span>
                  <button @click="addItemToInventory({ ...a, qty: 1 })" class="btn-sub btn-tiny">+</button>
                </div>
              </div>
            </div>

            <!-- Shields & Helmets -->
            <div class="shop-column">
              <h4 class="card-subtitle">Shields & Helmets</h4>
              <div class="shop-items font-serif">
                <div v-for="s in SHIELDS" :key="s.name" class="shop-item-row">
                  <span>{{ s.name }} Shield ({{ s.cost }} gp)</span>
                  <button @click="addItemToInventory({ ...s, weight: s.weight, qty: 1 })" class="btn-sub btn-tiny">+</button>
                </div>
                <hr class="mt-1" />
                <div v-for="h in HELMETS" :key="h.name" class="shop-item-row">
                  <span>{{ h.name }} ({{ h.cost }} gp)</span>
                  <button @click="addItemToInventory({ ...h, weight: h.weight, qty: 1 })" class="btn-sub btn-tiny">+</button>
                </div>
              </div>
            </div>

            <!-- Misc Items -->
            <div class="shop-column">
              <h4 class="card-subtitle">Miscellaneous</h4>
              <div class="shop-items font-serif">
                <div v-for="m in MISC_ITEMS" :key="m.name" class="shop-item-row">
                  <span>{{ m.name }} ({{ m.cost }} gp)</span>
                  <button @click="addItemToInventory({ ...m, qty: 1 })" class="btn-sub btn-tiny">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: SPELLS SELECTION -->
      <div v-if="activeTab === 'spells'" class="tab-content">
        <div class="grid-2">
          <!-- Spell slots & setup -->
          <div class="form-card">
            <h3 class="card-title">Spell slots per Day</h3>
            
            <div class="spell-slots-grid font-sans">
              <div class="slots-box">
                <h4>Primary Class: {{ CLASSES[primaryClass].name }}</h4>
                <div v-if="spellSlots.primary.length === 0" class="font-serif">No spell slots available.</div>
                <ul v-else class="font-serif">
                  <li v-for="(slots, index) in spellSlots.primary" :key="index">
                    Level {{ index + 1 }} Spells: <strong>{{ slots }}</strong> slots/day
                  </li>
                </ul>
              </div>

              <div v-if="secondaryClass && spellSlots.secondary.length > 0" class="slots-box">
                <h4>Secondary Class: {{ CLASSES[secondaryClass].name }}</h4>
                <ul class="font-serif">
                  <li v-for="(slots, index) in spellSlots.secondary" :key="index">
                    Level {{ index + 1 }} Spells: <strong>{{ slots }}</strong> slots/day
                  </li>
                </ul>
              </div>
            </div>

            <!-- Magic specializations details -->
            <div class="magic-subclasses mt-2">
              <div v-if="primaryClass === 'mage' || secondaryClass === 'mage'" class="form-group">
                <label>Mage Specialization School</label>
                <select v-model="mageSpecialistSchool">
                  <option value="">Generalist</option>
                  <option value="Abjurer">Abjurer (Opposed Alteration)</option>
                  <option value="Transmuter">Transmuter (Opposed Abjuration, Necromancy)</option>
                  <option value="Conjurer">Conjurer (Opposed Greater Divination)</option>
                  <option value="Diviner">Diviner (Opposed Illusion/Phantasm)</option>
                  <option value="Oracle">Oracle (Opposed Conjuration/Summoning)</option>
                  <option value="Enchanter">Enchanter (Opposed Invocation/Evocation)</option>
                  <option value="Illusionist">Illusionist (Opposed Divination, Necromancy)</option>
                  <option value="Invoker">Invoker (Opposed Enchantment/Charm)</option>
                  <option value="Necromancer">Necromancer (Opposed Alteration, Illusion/Phantasm)</option>
                </select>
                <div class="form-group mt-05">
                  <label>Mage's Chosen Name (Adept Trial Sigil Name)</label>
                  <input type="text" v-model="mageSpecialistName" placeholder="e.g. Master Thorne" />
                </div>
              </div>

              <div v-if="primaryClass === 'sorcerer' || secondaryClass === 'sorcerer'" class="form-group">
                <label>Sorcerer Patron / Master Name</label>
                <input type="text" v-model="sorcererPatron" placeholder="e.g. The Night Weaver" />
              </div>

              <div v-if="isPriest" class="form-group">
                <label>Priest Patron Deity / Order</label>
                <input type="text" v-model="priestDeity" placeholder="e.g. Ilya, Wysla, or Ayla" />
              </div>
            </div>
          </div>

          <!-- Spells Selection database -->
          <div class="form-card">
            <h3 class="card-title">Select Known Spells</h3>
            
            <div class="spells-selector font-serif">
              <div v-for="level in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="level" class="spell-level-section">
                <!-- Check if character has slots at this level -->
                <div class="spell-level-hdr font-sans">Level {{ level }} Spells</div>
                
                <div class="spell-items-list">
                  <div v-for="sp in filteredSpells.filter(s => s.level === level)" :key="sp.name" 
                       :class="{ selected: selectedSpells.some(s => s.name === sp.name) }"
                       @click="toggleSpell(sp)"
                       class="spell-row">
                    <div class="spell-row-hdr">
                      <span><strong>{{ sp.name }}</strong> ({{ sp.school }})</span>
                      <span class="badge badge-tiny">Select</span>
                    </div>
                    <div class="spell-row-details font-sm">
                      CT: {{ sp.castingTime }} | Range: {{ sp.range }} | Dur: {{ sp.duration }} | Save: {{ sp.save }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 6: FULL PREVIEW (matches standard paper S&D sheet) -->
      <div v-if="activeTab === 'preview'" class="tab-content preview-container">
        <div class="sheet-preview-banner">
          <p class="font-serif">This matches the layout of the character sheet pages. Click "Print/Save PDF" at the top of the page to print or save a copy of this pre-formatted sheet.</p>
        </div>
      </div>
    </div>

    <!-- PRINT SHEET HTML (formatted for window.print() and preview) -->
    <div :class="{ 'preview-mode': activeTab === 'preview' }" class="print-sheet-root">
      
      <!-- PAGE 1: CHARACTER GENERAL DETAILS -->
      <div class="print-page font-sans">
        <div class="sheet-header border-bottom">
          <div class="header-details">
            <div class="detail-row">
              <div class="input-line flex-2">CHARACTER: <span>{{ characterName }}</span></div>
              <div class="input-line flex-1">PLAYER: <span>{{ playerName }}</span></div>
            </div>
            <div class="detail-row">
              <div class="input-line flex-1">ALIGN: <span>{{ alignment }}</span></div>
              <div class="input-line flex-2">CLASS: <span>{{ levelText }}</span></div>
              <div class="input-line flex-2">ANCESTRY: <span>{{ ANCESTRIES[ancestry].name }}</span></div>
            </div>
            <div class="detail-row">
              <div class="input-line flex-2">HOMELAND: <span>{{ homeland }}</span></div>
              <div class="input-line flex-2">RELIGION: <span>{{ religion }}</span></div>
              <div class="input-line flex-1">UPKEEP: <span>{{ lifeStage }}</span></div>
            </div>
            <div class="detail-row">
              <div class="input-line flex-1">XP (PRIMARY): <span>0</span></div>
              <div class="input-line flex-1">XP (SECONDARY): <span>0</span></div>
            </div>
          </div>
          <div class="header-title font-cinzel">
            <h2>SWORDS</h2>
            <h3>&amp; DARKNESS</h3>
            <span class="sheet-subtitle">CHARACTER SHEET</span>
          </div>
        </div>

        <!-- Main Body Grid -->
        <div class="sheet-grid-top">
          <!-- Left Columns (Stats, AC, HP, Saves, Movement) -->
          <div class="left-section">
            
            <!-- Abilities -->
            <div class="block-section">
              <h4 class="section-title font-cinzel">ABILITIES</h4>
              <div class="abilities-sheet">
                <div v-for="stat in ['str', 'dex', 'con', 'int', 'wis', 'cha']" :key="stat" class="ability-row">
                  <div class="ability-score-box">
                    <span class="ability-val">{{ finalScores[stat] }}</span>
                  </div>
                  <span class="ability-label font-cinzel font-bold">{{ stat.toUpperCase() }}</span>
                  <div class="ability-details font-serif">
                    <span v-if="stat === 'str'">
                      Atk Mod: {{ strDetails.atk >= 0 ? `+${strDetails.atk}` : strDetails.atk }} | Dmg Mod: {{ strDetails.dmg >= 0 ? `+${strDetails.dmg}` : strDetails.dmg }} | Max Carry: {{ strDetails.maxW }} kg
                      <span v-if="exceptionalPercent > 0"> (Percentile: 18/{{ exceptionalPercent }})</span>
                    </span>
                    <span v-if="stat === 'dex'">
                      Surprise/Reflex Mod: {{ dexDetails.surprise >= 0 ? `+${dexDetails.surprise}` : dexDetails.surprise }} | AC Mod: {{ dexDetails.acMod >= 0 ? `+${dexDetails.acMod}` : dexDetails.acMod }} | Missile: {{ dexDetails.missile >= 0 ? `+${dexDetails.missile}` : dexDetails.missile }}
                    </span>
                    <span v-if="stat === 'con'">
                      HP Mod: {{ conDetails.hp >= 0 ? `+${conDetails.hp}` : conDetails.hp }} | System Shock: {{ conDetails.shock }} | Resurrection: {{ conDetails.res }}
                    </span>
                    <span v-if="stat === 'int'">
                      Bonus Langs: {{ intDetails.lang }} | Max Spell Level: {{ intDetails.maxLvl }} | Learn Spell: {{ intDetails.learn }}
                    </span>
                    <span v-if="stat === 'wis'">
                      Will Modifier: {{ wisDetails.def >= 0 ? `+${wisDetails.def}` : wisDetails.def }} | Priest Bonus Spells: {{ wisDetails.bonus }}
                    </span>
                    <span v-if="stat === 'cha'">
                      Max Henchmen: {{ chaDetails.hench }} | Loyalty: {{ loyaltyModText }} | Reaction: {{ reactionModText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Armor & Defenses -->
            <div class="block-section">
              <h4 class="section-title font-cinzel">ARMOR &amp; DEFENSES</h4>
              <div class="defenses-sheet">
                <div class="ac-shield-box">
                  <div class="shield-graphic">
                    <span class="ac-label">AC</span>
                    <span class="ac-val">{{ armorClass }}</span>
                  </div>
                </div>
                
                <div class="adjusted-ac font-serif">
                  <div class="adj-row">SURPRISED: <span>{{ armorClass - Math.max(0, dexDetails.acMod) }}</span></div>
                  <div class="adj-row">SHIELDLESS: <span>{{ equippedShield ? armorClass - equippedShield.acBonus : armorClass }}</span></div>
                  <div class="adj-row">REAR: <span>{{ armorClass - Math.max(0, dexDetails.acMod) }}</span></div>
                </div>

                <div class="armor-pieces border-left font-serif">
                  <div>ARMOR TYPE: <span>{{ equippedArmor?.name || 'Unarmored' }}</span></div>
                  <div>SHIELD: <span>{{ equippedShield?.name || 'None' }}</span></div>
                  <div>HELMET: <span>{{ equippedHelmet?.name || 'None' }}</span></div>
                </div>

                <div class="hit-points-box border-left">
                  <div class="hp-hd font-serif">
                    HIT DICE: <span>{{ levelPrimary }}{{ secondaryClass ? ` / ${levelSecondary}` : '' }}</span>
                  </div>
                  <div class="hp-boxes font-serif">
                    <div class="hp-sub-box">CURRENT<div class="box-empty"></div></div>
                    <div class="hp-sub-box">MAXIMUM<div class="box-fill">{{ hpMaximum }}</div></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Saving Throws & Movement -->
            <div class="grid-2-sections">
              <div class="block-section">
                <h4 class="section-title font-cinzel">SAVING THROWS</h4>
                <table class="saves-table font-serif">
                  <thead>
                    <tr class="font-sans">
                      <th>SAVES</th>
                      <th>ATTR</th>
                      <th>MOD</th>
                      <th>SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>FORTITUDE</td>
                      <td class="font-sans">CON</td>
                      <td>{{ conDetails.poison >= 0 ? `+${conDetails.poison}` : conDetails.poison }}</td>
                      <td><strong>{{ saves.fort }}</strong></td>
                    </tr>
                    <tr>
                      <td>REFLEX</td>
                      <td class="font-sans">DEX</td>
                      <td>{{ dexDetails.surprise >= 0 ? `+${dexDetails.surprise}` : dexDetails.surprise }}</td>
                      <td><strong>{{ saves.ref }}</strong></td>
                    </tr>
                    <tr>
                      <td>WILL</td>
                      <td class="font-sans">WIS</td>
                      <td>{{ wisDetails.def >= 0 ? `+${wisDetails.def}` : wisDetails.def }}</td>
                      <td><strong>{{ saves.will }}</strong></td>
                    </tr>
                  </tbody>
                </table>
                <div class="saves-note font-serif font-xs mt-05">
                  Strong save: +1 per 4 levels · Weak save: +1 per 8 levels · Roll d20 under score to succeed.
                </div>
              </div>

              <div class="block-section border-left">
                <h4 class="section-title font-cinzel">MOVEMENT</h4>
                <div class="movement-sheet font-serif">
                  <div>BASE RATE: <span>{{ ANCESTRIES[ancestry].speed }} m</span></div>
                  <div>LIGHT: <span>{{ encumbranceDetails.stage.includes('Light') || encumbranceDetails.stage.includes('Non') ? encumbranceDetails.speed : '—' }}</span></div>
                  <div>MODERATE: <span>{{ encumbranceDetails.stage.includes('Mod') ? encumbranceDetails.speed : '—' }}</span></div>
                  <div>HEAVY: <span>{{ encumbranceDetails.stage.includes('Heavy') ? encumbranceDetails.speed : '—' }}</span></div>
                  <div>SEVERE: <span>{{ encumbranceDetails.stage.includes('Sev') || encumbranceDetails.stage.includes('Over') ? encumbranceDetails.speed : '—' }}</span></div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column (Portrait, Special abilities) -->
          <div class="right-section border-left">
            <div class="portrait-box">
              <span class="portrait-placeholder font-cinzel">PORTRAIT</span>
            </div>
            
            <div class="block-section mt-1">
              <h4 class="section-title font-cinzel">SPECIAL ABILITIES / ATTACKS</h4>
              <div class="abilities-list font-serif">
                <ul>
                  <!-- Ancestry Traits -->
                  <li v-for="t in ANCESTRIES[ancestry].traits" :key="t" class="ability-bullet">{{ t }}</li>
                  <!-- Class Features -->
                  <li v-for="f in CLASSES[primaryClass].features" :key="f" class="ability-bullet">{{ f }}</li>
                  <li v-if="secondaryClass" v-for="f in CLASSES[secondaryClass].features" :key="f" class="ability-bullet">{{ f }}</li>
                  <!-- Specialized spellcaster items -->
                  <li v-if="mageSpecialistSchool" class="ability-bullet">Specialist School: {{ mageSpecialistSchool }} (Adept Trial name: {{ mageSpecialistName || 'None' }})</li>
                  <li v-if="sorcererPatron" class="ability-bullet">Sorcerer Patron: {{ sorcererPatron }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Weapons & Combat Row -->
        <div class="block-section mt-1">
          <h4 class="section-title font-cinzel">WEAPON &amp; COMBAT</h4>
          <table class="weapons-table font-serif">
            <thead>
              <tr class="font-sans">
                <th>WEAPON</th>
                <th>#AT</th>
                <th>ATK ADJ</th>
                <th>DMG ADJ</th>
                <th>ATK BONUS</th>
                <th>DAM (S-M/L)</th>
                <th>RANGE</th>
                <th>WEIGHT</th>
                <th>SIZE</th>
                <th>TYPE</th>
                <th>SPEED</th>
                <th>INIT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in inventory.filter(i => WEAPONS.some(w => w.name === i.name))" :key="item.name">
                <td>{{ item.name }}</td>
                <td>{{ item.rof || '1' }}</td>
                <td>{{ item.type === 'P' || item.type === 'B' ? (dexDetails.missile >= 0 ? `+${dexDetails.missile}` : dexDetails.missile) : (strDetails.atk >= 0 ? `+${strDetails.atk}` : strDetails.atk) }}</td>
                <td>{{ item.type === 'P' ? '0' : (strDetails.dmg >= 0 ? `+${strDetails.dmg}` : strDetails.dmg) }}</td>
                <td>+{{ attackBonus }}</td>
                <td>{{ item.dmgSM }} / {{ item.dmgL }}</td>
                <td>{{ item.range || 'Melee' }}</td>
                <td>{{ item.weight }} kg</td>
                <td>{{ item.size }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.speed }}</td>
                <td>{{ 10 - item.speed }}</td>
              </tr>
              <!-- Empty rows if less weapons -->
              <tr v-for="n in Math.max(0, 3 - inventory.filter(i => WEAPONS.some(w => w.name === i.name)).length)" :key="'empty-w-'+n">
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
              </tr>
            </tbody>
          </table>
          <div class="combat-notes font-serif font-xs mt-05">
            Initiative = d10 + 10 - Weapon Speed • High roll acts first | Attack Roll: d20 + Attack Bonus + Modifiers >= target AC
          </div>
        </div>

        <!-- Equipment & Skills Row -->
        <div class="grid-3 mt-1">
          <div class="block-section col-span-2">
            <h4 class="section-title font-cinzel">EQUIPMENT</h4>
            <div class="eq-grid font-serif">
              <div class="eq-col">
                <div v-for="(item, idx) in inventory.filter((_, i) => i % 2 === 0)" :key="idx" class="eq-row">
                  <span>{{ item.name }} (x{{ item.qty }})</span>
                  <span>{{ item.weight * item.qty }} kg</span>
                </div>
              </div>
              <div class="eq-col border-left">
                <div v-for="(item, idx) in inventory.filter((_, i) => i % 2 !== 0)" :key="idx" class="eq-row">
                  <span>{{ item.name }} (x{{ item.qty }})</span>
                  <span>{{ item.weight * item.qty }} kg</span>
                </div>
              </div>
            </div>
            <div class="enc-row border-top mt-05 font-serif">
              <span>ENCUMBRANCE LEVEL: <strong>{{ encumbranceDetails.stage.toUpperCase() }}</strong></span>
              <span>TOTAL WEIGHT: <strong>{{ totalWeight }}</strong> / {{ encumbranceDetails.limitMax }} kg</span>
            </div>
          </div>

          <div class="block-section border-left">
            <h4 class="section-title font-cinzel">SKILLS</h4>
            <div class="skills-list-sheet font-serif">
              <ul>
                <li v-for="s in selectedSkills" :key="s" class="skill-sheet-row">
                  <span>{{ s }}</span>
                  <span class="font-sans font-bold">{{ SKILLS.find(sk => sk.name === s)?.attr.toUpperCase() }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Treasures & Supplies Row -->
        <div class="grid-3 mt-1 border-top pt-05 font-serif">
          <div class="block-section">
            <h4 class="section-title font-cinzel">GOLD &amp; TREASURE</h4>
            <div class="gold-rows">
              <div>GP: <span>{{ goldPieces }}</span></div>
              <div>SP: <span>{{ goldTreasures.sp }}</span></div>
              <div>CP: <span>{{ goldTreasures.cp }}</span></div>
              <div>GEMS: <span class="gems-val">{{ goldTreasures.gems || 'None' }}</span></div>
            </div>
          </div>
          <div class="block-section border-left col-span-2">
            <h4 class="section-title font-cinzel">SUPPLIES</h4>
            <div class="supplies-row font-serif">
              <div>WATER/WINE: 
                <span class="boxes-row">
                  <span v-for="n in 12" :key="'w-box-'+n" :class="{ checked: n <= supplies.water }" class="box-small"></span>
                </span>
              </div>
              <div class="mt-05">RATIONS: 
                <span class="boxes-row">
                  <span v-for="n in 12" :key="'r-box-'+n" :class="{ checked: n <= supplies.rations }" class="box-small"></span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- PAGE 2: LANGUAGES AND SPELLS -->
      <div class="print-page font-sans mt-2">
        <div class="sheet-header border-bottom">
          <h2 class="font-cinzel">SWORDS &amp; DARKNESS — CHARACTER DETAILS</h2>
          <span class="font-serif">Page 2: Equipment (Stored), Languages, and Spell Records</span>
        </div>

        <div class="grid-2-equal mt-1">
          <!-- Stored Equipment -->
          <div class="block-section">
            <h4 class="section-title font-cinzel">EQUIPMENT (STORED)</h4>
            <div class="eq-stored-lines font-serif">
              <div v-for="n in 12" :key="'stored-'+n" class="stored-row border-bottom">
                <span>&nbsp;</span><span>&nbsp;</span>
              </div>
            </div>
          </div>

          <!-- Languages -->
          <div class="block-section border-left">
            <h4 class="section-title font-cinzel">LANGUAGES</h4>
            <div class="languages-lines font-serif">
              <ul>
                <li>Common</li>
                <li v-if="ancestry !== 'human'">{{ ancestry.toUpperCase() }} (Ancestral)</li>
                <li v-if="mageSpecialistSchool">High Solaran (Arcane)</li>
                <li v-if="primaryClass === 'druid' || secondaryClass === 'druid'">Druidic</li>
                <!-- Extra lines -->
                <li v-for="n in Math.max(0, 8 - (ancestry !== 'human' ? 2 : 1))" :key="'lang-empty-'+n" class="border-bottom">&nbsp;</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Spells List -->
        <div class="block-section mt-2">
          <h4 class="section-title font-cinzel">SPELLS MEMORIZED / KNOWN</h4>
          <div class="spells-preview-grid font-serif">
            <div v-for="level in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="'sp-lvl-'+level" class="lvl-col">
              <h5 class="font-sans font-bold">LEVEL {{ level }}</h5>
              <ul>
                <li v-for="sp in selectedSpells.filter(s => s.level === level)" :key="sp.name">
                  {{ sp.name }}
                </li>
                <li v-if="selectedSpells.filter(s => s.level === level).length === 0" class="empty-spell-slot">—</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Patron and Deity details bottom page 2 -->
        <div class="grid-3 mt-2 border-top pt-1 font-serif">
          <div>MAGE/PRIEST NAME: <span>{{ mageSpecialistName || '—' }}</span></div>
          <div>SCHOOL/ORDER: <span>{{ mageSpecialistSchool || priestDeity || '—' }}</span></div>
          <div>MASTER/PATRON: <span>{{ sorcererPatron || '—' }}</span></div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
/* Core Styling using S&D Wiki harmonized colors */
.character-builder-wrapper {
  margin: 20px 0;
  padding: 15px;
  background: rgba(18, 18, 18, 0.7);
  border: 1px solid rgba(202, 97, 41, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.builder-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(202, 97, 41, 0.3);
  padding-bottom: 10px;
}

.cinzel-title {
  font-family: "Cinzel", serif !important;
  color: #CA6129;
  font-size: 28px;
  margin: 0;
}

.subtitle {
  color: #dddddd;
  font-size: 16px;
  margin: 5px 0 0 0;
}

.action-banner {
  background: rgba(0, 0, 0, 0.4);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 20px;
}

.file-io {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn-action {
  background: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: #444;
  border-color: #777;
}

.btn-highlight {
  background: #CA6129 !important;
  border-color: #CA6129 !important;
}

.btn-highlight:hover {
  background: #B0501F !important;
}

.file-label {
  display: inline-block;
}

.error-msg {
  color: #ff6b6b;
  margin-top: 10px;
  font-size: 14px;
}

.validation-warning {
  background: rgba(202, 97, 41, 0.15);
  border: 1px solid #CA6129;
  color: #ffb88c;
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;
}

.warning-title {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.validation-warning ul {
  margin: 0;
  padding-left: 20px;
}

/* Tabs Navigation */
.builder-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 5px;
  margin-bottom: 20px;
}

.nav-tab {
  background: transparent;
  color: #aaa;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: bold;
  font-size: 15px;
  border-radius: 6px 6px 0 0;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  color: #CA6129;
  border-bottom: 3px solid #CA6129;
  background: rgba(202, 97, 41, 0.08);
}

.nav-tab-highlight {
  color: #ffb88c;
}

/* Tab Layout Grid */
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.grid-2-sub {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mt-2 { margin-top: 20px; }
.mt-1 { margin-top: 10px; }
.mt-05 { margin-top: 5px; }
.col-span-2 { grid-column: span 2; }

/* Cards & Forms */
.form-card {
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
}

.card-title {
  margin: 0 0 15px 0;
  color: #CA6129;
  font-size: 20px;
  font-family: "Cinzel", serif;
  border-bottom: 1px solid rgba(202, 97, 41, 0.15);
  padding-bottom: 8px;
}

.card-subtitle {
  margin: 0 0 10px 0;
  color: #ffb88c;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 5px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 12px;
  text-transform: uppercase;
  color: #999;
  margin-bottom: 5px;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  background: #111;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
}

.form-group input:focus, .form-group select:focus {
  border-color: #CA6129;
  outline: none;
}

/* Point Buy & Rolls */
.roller-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.btn-sub {
  background: #252525;
  color: #ccc;
  border: 1px solid #444;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-sub:hover, .btn-sub.active {
  background: #CA6129;
  color: #fff;
  border-color: #CA6129;
}

.pointbuy-banner, .rolled-banner {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.badge {
  background: #CA6129;
  color: #fff;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
}

.badge-sub {
  background: #444;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 15px;
}

.stat-control {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}

.stat-name {
  font-weight: bold;
  display: block;
  color: #999;
  margin-bottom: 8px;
}

.score-adjust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.btn-adjust {
  background: #333;
  color: #fff;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
}

.btn-adjust:hover {
  background: #CA6129;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-input {
  width: 50px !important;
  text-align: center;
  font-size: 16px;
  padding: 3px !important;
}

.stat-displays {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #ccc;
  gap: 2px;
}

/* HP & Saves cards */
.highlight-card {
  text-align: center;
  background: rgba(202, 97, 41, 0.05);
  border: 1px solid rgba(202, 97, 41, 0.2);
}

.highlight-title {
  display: block;
  font-size: 13px;
  font-weight: bold;
  color: #ffb88c;
  margin-bottom: 10px;
}

.highlight-value {
  font-size: 32px;
  font-weight: bold;
  color: #CA6129;
}

.highlight-subtitle {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.saves-flex {
  display: flex;
  justify-content: space-around;
  margin: 10px 0;
}

.save-val {
  font-size: 22px;
  color: #CA6129;
  display: block;
}

.hp-control {
  margin: 10px 0;
}

.hp-input-field {
  width: 80px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  padding: 5px;
  background: #111;
  border: 1px solid #444;
  color: #fff;
  border-radius: 4px;
}

/* Skills Selection */
.skills-banner {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.skill-list-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 768px) {
  .skill-list-grid {
    grid-template-columns: 1fr;
  }
}

.skill-item {
  background: #1a1a1a;
  border: 1px solid #333;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.skill-item:hover {
  background: #252525;
  border-color: #555;
}

.skill-item.selected {
  border-color: #CA6129;
  background: rgba(202, 97, 41, 0.05);
}

.skill-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skill-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.skill-name {
  font-weight: bold;
}

.skill-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #888;
}

/* Equipment and Inventory */
.encumbrance-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.inventory-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.inventory-table th, .inventory-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #333;
}

.inventory-table th {
  color: #999;
  font-weight: bold;
}

.btn-tiny {
  padding: 2px 6px;
  font-size: 11px;
}

.btn-tiny.danger {
  background: rgba(255, 70, 70, 0.2);
  border-color: rgba(255, 70, 70, 0.4);
  color: #ff8888;
}

.btn-tiny.danger:hover {
  background: #ff4444;
  color: #fff;
}

.empty-inventory {
  text-align: center;
  color: #777;
  padding: 20px 0;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

@media (max-width: 1024px) {
  .shop-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.shop-items {
  max-height: 250px;
  overflow-y: auto;
  background: #111;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
}

.shop-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #222;
  font-size: 13px;
}

/* Spells Selector */
.spells-selector {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 5px;
}

.spell-level-section {
  margin-bottom: 20px;
}

.spell-level-hdr {
  background: rgba(202, 97, 41, 0.15);
  color: #ffb88c;
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 4px;
  margin-bottom: 8px;
}

.spell-row {
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #333;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.spell-row:hover {
  background: #252525;
}

.spell-row.selected {
  border-color: #CA6129;
  background: rgba(202, 97, 41, 0.08);
}

.spell-row-hdr {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.spell-row-details {
  color: #888;
}

/* Preview Sheet Layout (Print styles included) */
.print-sheet-root {
  display: none; /* Hidden by default in editor mode */
  background: white;
  color: black;
  width: 210mm; /* A4 size */
  min-height: 297mm;
  padding: 15mm;
  box-sizing: border-box;
  margin: 20px auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.print-sheet-root.preview-mode {
  display: block; /* Shown in the 6th tab */
}

/* Media Print Overrides */
@media print {
  .no-print {
    display: none !important;
  }
  .print-sheet-root {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
    width: auto !important;
    min-height: auto !important;
    background: transparent !important;
  }
  body {
    background: white !important;
    color: black !important;
  }
  .print-page {
    page-break-after: always;
    margin-bottom: 0 !important;
    padding: 10mm !important;
    height: 100vh;
    box-sizing: border-box;
  }
}

/* Print CSS Layout (Official character sheet styling) */
.print-page {
  background: white;
  color: black;
  font-family: Arial, sans-serif;
  margin-bottom: 20px;
}

.border-bottom { border-bottom: 2px solid black; }
.border-top { border-top: 1px solid black; }
.border-left { border-left: 1px solid black; }
.pt-05 { padding-top: 5px; }

.sheet-header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.header-details {
  flex-grow: 1;
}

.detail-row {
  display: flex;
  margin-bottom: 5px;
  gap: 15px;
}

.input-line {
  border-bottom: 1px solid #777;
  padding-bottom: 2px;
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

.input-line span {
  font-family: Georgia, serif;
  font-size: 14px;
  color: black;
  font-weight: normal;
  padding-left: 5px;
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

.header-title {
  text-align: right;
  min-width: 180px;
}

.header-title h2 {
  font-size: 26px;
  margin: 0;
  line-height: 1;
}

.header-title h3 {
  font-size: 20px;
  margin: 0;
  line-height: 1;
}

.sheet-subtitle {
  font-size: 10px;
  letter-spacing: 2px;
  display: block;
}

/* Grid Layouts for Sheet sections */
.sheet-grid-top {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.block-section {
  border: 1px solid black;
  padding: 5px 10px;
}

.section-title {
  margin: -10px 0 8px 0;
  background: white;
  display: inline-block;
  padding: 0 5px;
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: bold;
}

/* Abilities Print */
.abilities-sheet {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ability-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ability-score-box {
  border: 1px solid black;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.ability-label {
  width: 45px;
  font-size: 13px;
}

.ability-details {
  font-size: 11px;
  color: #333;
}

/* Defenses print */
.defenses-sheet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ac-shield-box {
  min-width: 60px;
}

.shield-graphic {
  border: 2px solid black;
  border-radius: 0 0 50% 50%;
  width: 50px;
  height: 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.ac-label {
  font-size: 9px;
  font-weight: bold;
}

.ac-val {
  font-size: 22px;
  font-weight: bold;
  line-height: 1;
}

.adjusted-ac {
  font-size: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.adj-row span {
  font-weight: bold;
  border-bottom: 1px solid black;
  padding: 0 4px;
}

.armor-pieces {
  font-size: 10px;
  padding-left: 10px;
}

.armor-pieces span {
  font-weight: bold;
}

.hit-points-box {
  padding-left: 10px;
  flex-grow: 1;
}

.hp-hd {
  font-size: 11px;
  margin-bottom: 5px;
}

.hp-boxes {
  display: flex;
  gap: 10px;
}

.hp-sub-box {
  font-size: 9px;
  text-align: center;
  flex: 1;
}

.box-empty {
  border: 1px solid black;
  height: 25px;
  margin-top: 2px;
}

.box-fill {
  border: 1px solid black;
  background: #f0f0f0;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  margin-top: 2px;
}

/* Saves print */
.grid-2-sections {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 15px;
}

.saves-table {
  width: 100%;
  font-size: 11px;
  border-collapse: collapse;
}

.saves-table th, .saves-table td {
  padding: 4px 6px;
  text-align: center;
}

.saves-table th {
  border-bottom: 1px solid black;
}

.movement-sheet {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.movement-sheet span {
  font-weight: bold;
}

/* Portrait print */
.portrait-box {
  border: 1px solid black;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.portrait-placeholder {
  color: #ccc;
  letter-spacing: 2px;
  font-size: 14px;
}

.abilities-list {
  font-size: 11px;
}

.ability-bullet {
  margin-bottom: 4px;
}

/* Weapons table print */
.weapons-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
  text-align: center;
}

.weapons-table th, .weapons-table td {
  border: 1px solid black;
  padding: 4px;
}

.weapons-table th {
  background: #f0f0f0;
}

/* Equipment sheet columns */
.eq-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  font-size: 11px;
}

.eq-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  border-bottom: 1px dotted #ccc;
}

.enc-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding-top: 5px;
}

.skills-list-sheet {
  font-size: 11px;
  max-height: 150px;
  overflow: hidden;
}

.skill-sheet-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dotted #ccc;
  margin-bottom: 3px;
}

.gold-rows {
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.gold-rows span {
  font-weight: bold;
  border-bottom: 1px solid black;
  padding: 0 4px;
}

.gems-val {
  font-size: 9px;
}

.supplies-row {
  font-size: 11px;
}

.boxes-row {
  display: inline-flex;
  gap: 2px;
  margin-left: 5px;
}

.box-small {
  border: 1px solid black;
  width: 10px;
  height: 10px;
  display: inline-block;
}

.box-small.checked {
  background: black;
}

/* Page 2 Print layout details */
.grid-2-equal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.eq-stored-lines {
  display: flex;
  flex-direction: column;
}

.stored-row {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  min-height: 20px;
}

.languages-lines ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.languages-lines li {
  padding: 4px 0;
  min-height: 18px;
}

.spells-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  font-size: 11px;
}

.lvl-col {
  border: 1px solid black;
  padding: 8px;
}

.lvl-col h5 {
  margin: 0 0 5px 0;
  border-bottom: 1px solid black;
}

.lvl-col ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.empty-spell-slot {
  color: #ccc;
}
</style>
