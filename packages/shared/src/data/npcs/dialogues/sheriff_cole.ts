/**
 * Sheriff Marcus Cole - Dialogue Trees
 *
 * An honest lawman, overwhelmed by the challenges of maintaining order
 * on the frontier. Potential ally who can provide information about
 * IVRC's activities and the Copperhead Gang.
 */

import type { DialogueTree } from '../../schemas/npc';

export const SheriffColeMainDialogue: DialogueTree = {
  id: 'sheriff_cole_main',
  name: 'Sheriff Cole - Main Conversation',
  description: 'Primary dialogue tree for Sheriff Marcus Cole',
  tags: ['dusty_springs', 'authority', 'quest_giver'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'quest_active',
      conditions: [{ type: 'quest_active', target: 'investigate_strangers' }],
      priority: 5,
    },
    {
      nodeId: 'return_greeting',
      conditions: [],
      priority: 0,
    },
  ],

  nodes: [
    // First meeting
    {
      id: 'first_meeting',
      text: "Hold up there, stranger. Don't believe I've seen your face around these parts. Name's Marcus Cole, Sheriff of Dusty Springs. You got business in my town, or just passin' through?",
      expression: 'suspicious',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Just arrived. Looking for work.',
          nextNodeId: 'work_response',
          conditions: [],
          effects: [],
          tags: ['neutral'],
        },
        {
          text: 'I received a letter. Summoned here.',
          nextNodeId: 'letter_response',
          conditions: [],
          effects: [],
          tags: ['main_quest'],
        },
        {
          text: 'None of your concern, Sheriff.',
          nextNodeId: 'hostile_response',
          conditions: [],
          effects: [],
          tags: ['aggressive'],
        },
      ],
    },

    {
      id: 'work_response',
      text: "Work, huh? Plenty of that to go 'round, but honest pay's harder to find. Railroad's always hirin', but I'd think twice 'fore signin' on with IVRC. They got a way of ownin' a man. General store might need hands, and there's always the mines up in the mountains.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "What's wrong with the railroad?",
          nextNodeId: 'railroad_warning',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Any trouble I should know about?',
          nextNodeId: 'town_trouble',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Thanks for the tip.',
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'change_reputation', value: 5 }],
          tags: [],
        },
      ],
    },

    {
      id: 'letter_response',
      text: "*His eyes narrow* A letter, you say? That's... interesting. Had a few folks come through lately, all with the same story. Some of 'em didn't leave town the way they came in, if you catch my meanin'. Mind if I ask who sent it?",
      expression: 'concerned',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "It's unsigned. Just a gear symbol.",
          nextNodeId: 'gear_symbol',
          conditions: [],
          effects: [],
          tags: ['main_quest'],
        },
        {
          text: "I'd rather not say.",
          nextNodeId: 'secretive_response',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Show him the letter.',
          nextNodeId: 'show_letter',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'gear_symbol',
      text: "*He takes a step back* The gear... I've seen that mark before. On the old Ironpick place, 'fore it burned down. Listen here, friend - there's folks in this town who don't take kindly to questions about that symbol. Watch your back, and if you learn anythin'... come find me.",
      expression: 'worried',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [
        { type: 'set_flag', target: 'sheriff_knows_letter' },
        { type: 'change_reputation', value: 10 },
      ],
      tags: [],
      choices: [
        {
          text: 'What happened to the Ironpick place?',
          nextNodeId: 'ironpick_history',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Who should I watch out for?',
          nextNodeId: 'watch_out_for',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "I'll be careful.",
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'start_quest', target: 'investigate_origins' }],
          tags: [],
        },
      ],
    },

    {
      id: 'hostile_response',
      text: "*His hand drifts to his hip* Now see here. I don't much care for that tone. Every stranger's got a story, and most of 'em are lies. But I'm a fair man. You cause trouble in my town, and we'll have words. The unfriendly kind. We clear?",
      expression: 'angry',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'change_reputation', value: -10 }],
      tags: [],
      choices: [
        {
          text: 'Crystal clear, Sheriff.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "I don't respond well to threats.",
          nextNodeId: 'standoff',
          conditions: [],
          effects: [],
          tags: ['aggressive'],
        },
      ],
    },

    {
      id: 'standoff',
      text: "*He squares his shoulders* Neither do I. But I got a badge, and you got nothin' but attitude. Walk away now, 'fore you make an enemy you can't afford.",
      expression: 'angry',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'change_reputation', value: -15 }],
      tags: [],
      choices: [
        {
          text: '[Walk away]',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'railroad_warning',
      text: "IVRC runs this territory, but they don't run it fair. Cornelius Thorne - the railroad baron - he's got his fingers in everything. Water rights, mining claims, even the law if he could. His enforcers pass through town regular, lookin' for 'troublemakers.' Mostly just folks who won't sell their land.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "Sounds like you don't approve.",
          nextNodeId: 'sheriff_position',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'What can you do about it?',
          nextNodeId: 'sheriff_limitations',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Good to know.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'sheriff_position',
      text: "*He sighs* I took this badge to protect people, not corporations. But IVRC's got lawyers and money. I've got a six-shooter and a conscience. Ain't always the winnin' combination it used to be.",
      expression: 'sad',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Maybe you need allies.',
          nextNodeId: 'ally_hint',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Times are changing.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'ally_hint',
      text: "Maybe I do. You seem like someone who understands what's at stake. The Copperheads think violence is the answer. The Freeminers think they can just hide in the mountains. But maybe there's another way. You find that way, you come tell me about it.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      tags: [],
      choices: [
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'sheriff_limitations',
      text: "What I can do? Keep the peace, mostly. Break up fights, jail drunks, investigate the odd murder. But when IVRC's Pinkertons come to town with warrants signed by judges in their pocket... my badge means about as much as a tin whistle.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'That must be frustrating.',
          nextNodeId: 'sheriff_frustration',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Thanks for being honest.',
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'change_reputation', value: 5 }],
          tags: [],
        },
      ],
    },

    {
      id: 'sheriff_frustration',
      text: "Frustrating don't begin to cover it. I fought in the war. Lost good men for the idea of justice. Now I watch it get bought and sold like cattle. But I ain't givin' up. Not yet.",
      expression: 'determined',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'The frontier needs men like you.',
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'change_reputation', value: 10 }],
          tags: [],
        },
      ],
    },

    {
      id: 'town_trouble',
      text: "Trouble? Heh. Where do I start? Copperhead Gang's been hittin' railroad shipments. IVRC's pressurin' the mayor to let 'em station more enforcers here. And folks keep disappearin' up near the mountains. Plenty to keep a lawman busy.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Tell me about the Copperheads.',
          nextNodeId: 'copperhead_info',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'People are disappearing?',
          nextNodeId: 'disappearances',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "I'll stay out of trouble.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'copperhead_info',
      text: "Led by a woman they call Diamondback. Dolores Vega's her real name. Used to work for IVRC 'til somethin' went wrong. Now she robs their trains and makes their lives miserable. Some call her an outlaw. Others call her a hero. Me? I call her a problem I ain't equipped to solve.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Where can I find her?',
          nextNodeId: 'copperhead_location',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Why do some call her a hero?',
          nextNodeId: 'copperhead_sympathy',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "I'll steer clear.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'copperhead_location',
      text: "Find her? *laughs* Half the territory's been tryin'. She moves around, but rumors say there's a hideout somewhere in Rattlesnake Canyon. Devil's Backbone country. Even if you got there, you'd likely not get back. Her boys don't take kindly to visitors.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'unlock_location', target: 'rattlesnake_canyon' }],
      tags: [],
      choices: [
        {
          text: 'Thanks for the warning.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'copperhead_sympathy',
      text: "Because IVRC's done wrong by a lot of folks. Miners worked to death for company scrip. Ranchers pushed off their land. Towns left to dry up when the railroad passed 'em by. Diamondback hits 'em where it hurts - their wallets. Some see justice in that.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Do you see justice in it?',
          nextNodeId: 'sheriff_moral',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Interesting perspective.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'sheriff_moral',
      text: "*Long pause* I see anger. Justified anger, maybe. But robbery's still robbery, and violence begets violence. The Copperheads have killed innocent guards, not just IVRC suits. That blood don't wash off, no matter who you're fightin'.",
      expression: 'thoughtful',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "A lawman's view.",
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'change_reputation', value: 5 }],
          tags: [],
        },
      ],
    },

    {
      id: 'disappearances',
      text: "Miners, mostly. Head up to work the independent claims in the Iron Mountains and just... don't come back. Could be accidents. Could be claim jumpers. Could be somethin' else. Freeminers up there won't talk to me. Say I'm too close to IVRC. Which is a damn lie, but try tellin' them that.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'set_flag', target: 'heard_about_disappearances' }],
      tags: [],
      choices: [
        {
          text: 'Maybe I could talk to them.',
          nextNodeId: 'investigate_offer',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Sounds dangerous.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'investigate_offer',
      text: "*He studies you* You know... that ain't a bad idea. Fresh face, no ties to IVRC or the law. You could get further than I ever could. There's a man named Samuel Ironpick, leads the Freeminers. Find him, earn his trust, and maybe we both learn somethin'. I'd owe you one.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'start_quest', target: 'investigate_disappearances' }],
      tags: [],
      choices: [
        {
          text: 'Where do I find this Samuel?',
          nextNodeId: 'samuel_location',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'samuel_location',
      text: "Freeminer's Hollow, up in the Iron Mountains. Take the trail north out of town, follow it through the passes. It's rough country, so pack supplies. And... be careful what you say up there. Tensions are high.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
      tags: [],
      choices: [
        {
          text: "I'll be diplomatic.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'ironpick_history',
      text: "Old place on the edge of town. Belonged to a miner's family 'fore they left for the mountains. Burned down about two years back. Arson, I figured, but never caught who did it. Few days before the fire, I saw IVRC men snoopin' around there. Make of that what you will.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'IVRC burned it down?',
          nextNodeId: 'ivrc_suspicion',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Can I see the site?',
          nextNodeId: 'burned_site',
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'ivrc_suspicion',
      text: "Can't prove nothin'. But Ironpicks were Freeminer leaders. Had documents, they said. Proof of IVRC wrongdoin'. After the fire, all that was gone. Coincidence? *shrugs* In my experience, there ain't many of those.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'The evidence was destroyed.',
          nextNodeId: 'evidence_destroyed',
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'evidence_destroyed',
      text: "Destroyed, or hidden. Old Samuel Ironpick, he got out before the fire. Took his granddaughter and headed for the mountains. If anyone knows what was in those documents, it's him. But he don't trust outsiders no more. Can't blame him.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Maybe I can earn his trust.',
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'set_flag', target: 'motivated_to_find_samuel' }],
          tags: [],
        },
      ],
    },

    {
      id: 'burned_site',
      text: "What's left of it, sure. North side of town, past the church. Just a foundation and ashes now. I've looked through it myself. If there was anythin' to find, it's long gone. But maybe fresh eyes'll see somethin' I missed.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'unlock_location', target: 'burned_homestead' }],
      tags: [],
      choices: [
        {
          text: "I'll take a look.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'watch_out_for',
      text: "Mayor Holt runs this town, but she answers to IVRC. She's not a bad woman - just scared. The real danger is Victoria Ashworth. Thorne's right hand. She ain't in town yet, but word is she's comin'. When she does, things'll get ugly.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'set_flag', target: 'warned_about_ashworth' }],
      tags: [],
      choices: [
        {
          text: "I'll watch for her.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    // Return greeting
    {
      id: 'return_greeting',
      text: "Back again. Got somethin' on your mind, or just checkin' in?",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Any news I should know about?',
          nextNodeId: 'latest_news',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'Need any help with anything?',
          nextNodeId: 'help_offer',
          conditions: [{ type: 'reputation_gte', value: 20 }],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'latest_news',
      text: "Same troubles, different day. Copperheads hit another shipment last week. IVRC's none too pleased. And the Mayor's been meetin' with railroad men in private. Never a good sign.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Thanks for keeping me informed.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'help_offer',
      text: "Appreciate that. You've shown yourself to be reliable. Tell you what - I hear about anythin' that needs doin', you'll be the first to know. This territory needs more folks willin' to do what's right.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'set_flag', target: 'sheriff_ally' }],
      tags: [],
      choices: [
        {
          text: 'You can count on me.',
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'change_reputation', value: 10 }],
          tags: [],
        },
      ],
    },

    // Quest active check-in
    {
      id: 'quest_active',
      text: "Any luck with that matter we discussed? Folks up in the mountains still keepin' quiet?",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Still working on it.',
          nextNodeId: 'quest_encouragement',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'I need more information.',
          nextNodeId: 'quest_info',
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'quest_encouragement',
      text: "Keep at it. These things take time. Just remember - trust has to be earned up there. Don't push too hard, too fast.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Understood.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'quest_info',
      text: "What do you need to know? Ask, and I'll tell you what I can.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Tell me about Samuel Ironpick.',
          nextNodeId: 'samuel_info',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: 'What should I avoid saying?',
          nextNodeId: 'what_to_avoid',
          conditions: [],
          effects: [],
          tags: [],
        },
        {
          text: "Nevermind, I'll figure it out.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'samuel_info',
      text: "Old man, tough as the mountain rock. Lost his son to a mine collapse - one that IVRC's safety inspectors should've prevented. Now he leads what's left of the independent miners. Suspicious of anyone he don't know, but fair once you've proven yourself.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'How do I prove myself?',
          nextNodeId: 'prove_yourself',
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'prove_yourself',
      text: "Help 'em with somethin'. They're always needin' supplies, protection from claim jumpers. Show 'em you ain't there to exploit. Actions speak louder than words in that country.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: 'Good advice. Thanks.',
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'what_to_avoid',
      text: "Don't mention IVRC in a positive light. Don't ask too many questions right off. And for God's sake, don't mention you've talked to me. Like I said, they think I'm compromised. Let 'em learn different through your actions.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "I'll be careful.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'show_letter',
      text: "*He takes the letter, reads it carefully* This is the same mark. The gear. And this address... that's the Ironpick place. Whoever sent this knew somethin'. Knew enough to get themselves killed, maybe. You watch yourself, hear?",
      expression: 'worried',
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [
        { type: 'set_flag', target: 'sheriff_examined_letter' },
        { type: 'change_reputation', value: 15 },
      ],
      tags: [],
      choices: [
        {
          text: 'What do you think it means?',
          nextNodeId: 'letter_meaning',
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },

    {
      id: 'letter_meaning',
      text: "Means someone wanted you to find somethin'. Somethin' at that burned-down house. Or maybe somethin' that was there before it burned. The Ironpicks knew things, had proof of IVRC's dirty work. If any of that survived... you could be sittin' on a powder keg.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [],
      tags: [],
      choices: [
        {
          text: "I'll investigate carefully.",
          nextNodeId: null,
          conditions: [],
          effects: [{ type: 'start_quest', target: 'investigate_letter' }],
          tags: [],
        },
      ],
    },

    {
      id: 'secretive_response',
      text: "*He frowns* Your business is your own, I suppose. But secrets have a way of gettin' folks killed in these parts. If you change your mind, you know where to find me.",
      conditions: [],
      nextNodeId: null,
      choiceDelay: 0,
      onEnterEffects: [{ type: 'change_reputation', value: -5 }],
      tags: [],
      choices: [
        {
          text: "I'll keep that in mind.",
          nextNodeId: null,
          conditions: [],
          effects: [],
          tags: [],
        },
      ],
    },
  ],
};

export const SheriffColeDialogues = [SheriffColeMainDialogue];
