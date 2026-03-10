import type { DialogueNode } from '../../../schemas/npc.ts';

export const diamondback_nodes_1: DialogueNode[] = [
{
      id: 'gang_numbers',
      text: "Enough to cause trouble. Not enough to win a war. *She shrugs* We raid, we disappear, we survive. That's the best we can do for now. IVRC's got Pinkertons, private armies, endless money. We've got determination and knowledge of the land.",
      choices: [
        {
          text: 'Could the Freeminers help?',
          nextNodeId: 'freeminer_alliance',
        },
        {
          text: 'I see.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'freeminer_alliance',
      text: "Old Samuel and I don't see eye to eye. He thinks violence makes us no better than IVRC. I think his peaceful resistance will get everyone killed. *She sighs* But if there was something that could unite us... something worth fighting for together...",
      onEnterEffects: [{ type: 'set_flag', target: 'diamondback_open_to_alliance' }],
      choices: [
        {
          text: 'Like the documents?',
          nextNodeId: 'documents_alliance',
        },
      ],
    },
{
      id: 'documents_alliance',
      text: "Maybe. Proof that could actually bring IVRC down legally... that'd be worth putting aside differences for. But those documents are just a rumor at this point. Someone would need to find them, verify they're real, get them to people who matter.",
      choices: [
        {
          text: 'I might be that someone.',
          nextNodeId: 'volunteer',
        },
      ],
    },
{
      id: 'volunteer',
      text: "*She studies you for a long moment* You might be. Fresh face, no faction ties, that letter in your pocket... *She nods slowly* Alright. You want to help? Start by earning Samuel's trust. Find those documents. Then we'll talk about what comes next.",
      onEnterEffects: [
        { type: 'set_flag', target: 'diamondback_ally' },
        { type: 'change_reputation', value: 25 },
      ],
      choices: [
        {
          text: "You'll hear from me.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'who_sent_letter',
      text: "Could be any of the old guard who survived. Problem is, most of 'em are dead, disappeared, or hidin' so deep they might as well be ghosts. But if I had to guess... *she thinks* ...Samuel Ironpick would know. He kept records of everyone in the movement.",
      choices: [
        {
          text: 'Where can I find him?',
          nextNodeId: 'samuel_location',
        },
      ],
    },
{
      id: 'samuel_location',
      text: "Freeminer's Hollow, up in the Iron Mountains. He don't trust strangers - don't blame him after what happened - but show him that letter and he'll at least hear you out. Tell him Dolores sends her regards... for what that's worth.",
      onEnterEffects: [{ type: 'unlock_location', target: 'freeminer_hollow' }],
      choices: [
        {
          text: 'Thank you, Diamondback.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'answers_first',
      text: "*She laughs - a harsh, humorless sound* You're in no position to make demands. But I respect the nerve. *She leans back* Fine. One question. Then you show me that letter.",
      choices: [
        {
          text: 'Why did you turn against IVRC?',
          nextNodeId: 'origin_story',
        },
        {
          text: "What happened to the workers' movement?",
          nextNodeId: 'movement_history',
        },
      ],
    },
{
      id: 'origin_story',
      text: "I worked for 'em. Telegraph operator at Junction City. Saw the messages that passed through - the orders to crush strikes, the bribes to officials, the cover-ups of mine deaths. When I tried to blow the whistle, they tried to bury me with the dead. *Her eyes go cold* I decided to bury them instead.",
      onEnterEffects: [{ type: 'set_flag', target: 'heard_diamondback_story' }],
      choices: [
        {
          text: '*Show her the letter*',
          nextNodeId: 'letter_examination',
        },
      ],
    },
{
      id: 'movement_history',
      text: "Crushed. Thorne's men came in the night, burned meeting halls, arrested leaders on fake charges. Some were hanged as 'agitators.' Others vanished into IVRC's private prisons. The lucky ones scattered to the mountains or changed their names.",
      choices: [
        {
          text: '*Show her the letter*',
          nextNodeId: 'letter_examination',
        },
      ],
    },
{
      id: 'personal_grudge',
      text: '*Her expression softens, just slightly* That makes two of us. IVRC takes and takes, and never answers for it. *She sheathes her knife* Tell me what happened.',
      choices: [
        {
          text: 'My family lost everything to their land grabs.',
          nextNodeId: 'land_grab_story',
        },
        {
          text: 'Someone close to me died in their mines.',
          nextNodeId: 'mine_death_story',
        },
        {
          text: "I'd rather not say. Just know I have reason.",
          nextNodeId: 'private_reason',
        },
      ],
    },
{
      id: 'land_grab_story',
      text: "*She nods grimly* Seen it a hundred times. IVRC wants land, they take it. Legal papers don't mean nothin' when you've got lawyers on retainer and sheriffs in your pocket. *She gestures* Sit. You ain't our enemy. Let's talk.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: 'Thank you.',
          nextNodeId: 'more_questions',
        },
      ],
    },
{
      id: 'mine_death_story',
      text: "*Her jaw tightens* The mines. Thorne's money pit, fed by bodies. How many good people have I met with that same story? *She waves to her men* Release 'em. This one knows our pain.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: 'I want to make them pay.',
          nextNodeId: 'make_them_pay',
        },
      ],
    },
{
      id: 'make_them_pay',
      text: "Then you're in the right place. We hit IVRC where it hurts - their shipments, their payrolls, their pride. It ain't justice in the legal sense, but it's the only kind we can get. You want in?",
      choices: [
        {
          text: "I'm in.",
          nextNodeId: 'join_copperheads',
        },
        {
          text: "Maybe there's another way to hurt them.",
          nextNodeId: 'other_way',
        },
      ],
    },
{
      id: 'join_copperheads',
      text: "*She extends a calloused hand* Then welcome to the Copperheads. We'll start you on small jobs, see what you're made of. Prove yourself, and you'll be family. Betray us... *her grip tightens* ...well, don't betray us.",
      onEnterEffects: [
        { type: 'set_flag', target: 'copperhead_member' },
        { type: 'change_reputation', value: 30 },
      ],
      choices: [
        {
          text: "I won't.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'private_reason',
      text: "Fair enough. We all got ghosts. *She studies you* Long as those ghosts point you toward IVRC and not toward us, we can work together. Sit down. I'll tell you what we're about.",
      onEnterEffects: [
        { type: 'clear_flag', target: 'captured_by_copperheads' },
        { type: 'change_reputation', value: 10 },
      ],
      choices: [
        {
          text: "I'd like to hear it.",
          nextNodeId: 'copperhead_mission',
        },
      ],
    },
{
      id: 'copperhead_mission',
      text: "We take from IVRC. Money, supplies, weapons. Whatever hurts their operations. We share with the folks they've ground down - miners' families, displaced ranchers, anyone blacklisted for standin' up. It ain't legal, but neither is what they do.",
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'help_copperheads',
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'help_copperheads',
      text: "First, you help yourself. Go find what you came here for - whoever sent that letter has plans for you. Once you know more, come back. We'll find work that fits your talents.",
      choices: [
        {
          text: "I'll return when I know more.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'practical_argument',
      text: "*She pauses, then laughs* Got some stones, don't you? *She sheathes the knife* Fine. You're right - bodies attract attention, and attention's the last thing we need right now. But you're not leavin' til you prove you're not a threat.",
      choices: [
        {
          text: 'What do you need?',
          nextNodeId: 'prove_yourself',
        },
      ],
    },
];
