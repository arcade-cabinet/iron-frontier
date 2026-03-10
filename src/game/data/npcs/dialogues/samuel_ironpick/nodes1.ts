import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_1: DialogueNode[] = [
{
      id: 'help_with_proof',
      text: "*He studies you for a long time* You remind me of someone. Someone who made promises like that once. *He sighs* Fine. Prove yourself first. Help my people, earn your place among us. Then we'll talk about the documents.",
      choices: [
        {
          text: 'What do your people need?',
          nextNodeId: 'earn_trust',
        },
      ],
    },
{
      id: 'sorry_for_son',
      text: "*He nods, his eyes glistening* Jacob was... he was the best of us. Strong, smart, believed the world could be fair if good people fought for it. *He wipes his eyes roughly* His daughter Maggie, she's got his fire. Won't let me rest, always pushin' to do somethin' about IVRC. *A ghost of a smile* She's right, of course.",
      choices: [
        {
          text: 'I would like to meet Maggie.',
          nextNodeId: 'meet_maggie',
        },
        {
          text: "His legacy lives on through her - and through you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'meet_maggie',
      text: "She's in the main lodge, probably arguin' with someone about our next move. *He chuckles* Girl's got opinions, I'll say that. *He grows serious* She's all I got left. If anything happened to her... *He trails off* You understand why I'm careful.",
      choices: [
        {
          text: 'I understand completely.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'claims_connection',
      text: "Now you're seein' it. The copper's worthless compared to what's down there. IVRC didn't come to this territory for ore. They came because someone whispered about ancient ruins under the mountains. Everything since - the railroad, the mines, the company towns - it's all a front. A way to dig without anyone askin' why.",
      onEnterEffects: [{ type: 'set_flag', target: 'understands_ivrc_motive' }],
      choices: [
        {
          text: "What do they want from The Old Works?",
          nextNodeId: 'what_ivrc_wants',
        },
        {
          text: 'This changes everything I thought I knew.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'what_ivrc_wants',
      text: "Technology. Machines that shouldn't exist. My son said he saw things down there that... *He struggles for words* Things that moved on their own. Metal that repaired itself. Lights that burned without flame or oil. If IVRC can figure out how it all works... *He shakes his head* They won't just control the territory. They'll control everything.",
      expression: 'fearful',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_remnant_technology' }],
      choices: [
        {
          text: 'Self-repairing metal? That sounds impossible.',
          nextNodeId: 'impossible_tech',
        },
        {
          text: 'We have to stop them.',
          nextNodeId: 'stop_ivrc',
        },
      ],
    },
{
      id: 'impossible_tech',
      text: "I'm a miner, not a philosopher. I know rock, I know ore, I know what belongs underground and what don't. And what's down there don't belong. Not in this world, not in this time. *He grips his pickaxe like a talisman* Jacob called it 'Remnant.' Said it felt like touching the bones of something ancient and vast.",
      choices: [
        {
          text: "The Remnant. Is that what IVRC calls it?",
          nextNodeId: 'remnant_name',
        },
        {
          text: "I need to see it for myself.",
          nextNodeId: 'see_it_yourself',
        },
      ],
    },
{
      id: 'remnant_name',
      text: "IVRC calls it 'Project Prometheus' in their internal documents. Fancy name for grave robbin'. But Jacob's name was better. Remnant. The remains of somethin' that was here before any of us. Before the tribes, before anything. And now Thorne wants to wake it up and sell it.",
      choices: [
        {
          text: "Some things should stay buried.",
          nextNodeId: null,
        },
        {
          text: "Or maybe it can help the people instead of the powerful.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'interested_in_remnant_use' }],
        },
      ],
    },
{
      id: 'see_it_yourself',
      text: "*He gives you a hard look* The tunnels ain't safe. IVRC's got guards at the main entries they've found. And beyond those guards... well, the miners who went too deep didn't come back. Or came back wrong. *He pauses* But if you earn your place here, I might show you the entrance Jacob found. The one IVRC don't know about.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_might_show_entrance' }],
      choices: [
        {
          text: "I'll earn that trust.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'stop_ivrc',
      text: "I've been tryin' for five years. Lost my son, my home, nearly lost my mind. The Copperheads rob their trains. We block their claims. None of it's enough. They just send more men, more lawyers, more money. *He clenches his fist* But the documents... if those reach the right hands...",
      choices: [
        {
          text: "Then let me help you get them out.",
          nextNodeId: 'help_with_proof',
        },
        {
          text: 'We need more than documents. We need unity.',
          nextNodeId: 'need_unity',
        },
      ],
    },
{
      id: 'need_unity',
      text: "*He snorts* Unity. You sound like Miguel. The Copperheads are hot-headed fools who think shootin' solves everything. The townfolk are too scared to spit without IVRC's permission. And my people... my people are tired. Tired of fightin', tired of hidin', tired of losin'.",
      choices: [
        {
          text: 'Tired people still have strength when someone gives them a reason.',
          nextNodeId: 'reason_to_fight',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
        {
          text: "You gave up on the Alliance.",
          nextNodeId: 'gave_up_alliance',
        },
      ],
    },
{
      id: 'reason_to_fight',
      text: "*He stares at you for a long moment, then his weathered face cracks into something almost like a smile* You talk like Jacob did. Like the world owes you a fair shake and you intend to collect. *He stands* Maybe that's what we need. Someone too stubborn to know when they're beat.",
      choices: [
        {
          text: "Then let me fight alongside you.",
          nextNodeId: null,
          effects: [
            { type: 'change_reputation', value: 15 },
            { type: 'set_flag', target: 'samuel_respects_player' },
          ],
        },
      ],
    },
{
      id: 'gave_up_alliance',
      text: "*His eyes flash* I didn't give up nothin'. The Alliance was betrayed. Sold out from the inside. After that, trust died. Can't build an alliance when half the people in it might be workin' for the enemy. *He looks away* Maybe I should've fought harder. But when you lose your son... priorities change.",
      choices: [
        {
          text: "No one could blame you.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'The traitor is still out there. Finding them could rebuild trust.',
          nextNodeId: 'find_traitor',
        },
      ],
    },
{
      id: 'find_traitor',
      text: "*He grips his pickaxe handle hard* I've wondered about that every damn night for five years. I've got suspicions but no proof. If you find the rat who sold us out... *His knuckles go white* ...bring them to me. I'll handle the rest.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_wants_traitor' }],
      choices: [
        {
          text: "Justice, not vengeance.",
          nextNodeId: 'justice_not_vengeance',
        },
        {
          text: "I'll find them.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'justice_not_vengeance',
      text: "*Long, heavy silence* You're right. Jacob wouldn't want vengeance. He'd want the truth. *He exhales slowly* Find the truth, then. But don't expect me to forgive easy. Forgivin' is for priests and saints. I'm just an old miner with a long memory.",
      choices: [
        {
          text: "That's fair enough.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'what_machines',
      text: "Jacob described 'em as... automatons. Metal bodies, shaped like people but not people. Standing in rows, deep underground. Silent. Still. Like soldiers waitin' for orders. *He shudders* He said they were beautiful and terrible at the same time. And he felt like they were watchin' him.",
      choices: [
        {
          text: 'Automatons? Like clockwork?',
          nextNodeId: 'not_clockwork',
        },
        {
          text: "That explains the strange sounds miners report.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'connected_sounds_to_remnant' }],
        },
      ],
    },
{
      id: 'not_clockwork',
      text: "No. Not clockwork. Somethin'... else. Smooth metal, no visible gears or springs. Jacob said they had faces, but not human faces. *He shakes his head* I told him he'd been breathin' too much mine dust. Then I saw one myself. *Very quietly* They ain't sleepin'. They're waitin'.",
      expression: 'fearful',
      choices: [
        {
          text: 'Waiting for what?',
          nextNodeId: 'waiting_for_what',
        },
      ],
    },
{
      id: 'waiting_for_what',
      text: "If I knew that, I'd either be runnin' for the border or sittin' on the biggest secret in human history. *He manages a grim smile* Maybe both. All I know is IVRC's diggin' closer to them every day. And the sounds from underground are gettin' louder.",
      choices: [
        {
          text: 'Then we need to stop IVRC before they wake something they cannot control.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'urgency_about_remnant' }],
        },
      ],
    },
{
      id: 'underground_knowledge',
      text: "*He raises an eyebrow* So Miguel's been talkin'. *He sighs* I told that old priest to keep quiet. But I suppose if IVRC's gettin' closer, silence don't help nobody. Yeah, there's somethin' underground. Somethin' that shouldn't be there. And IVRC's been diggin' toward it for five years.",
      choices: [
        {
          text: "Tell me everything.",
          nextNodeId: 'old_works_explanation',
        },
      ],
    },
];
