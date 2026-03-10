import type { DialogueNode } from '../../../schemas/npc.ts';

export const samuel_ironpick_nodes_0: DialogueNode[] = [
{
      id: 'first_meeting',
      text: "*A grizzled old man with a silver beard looks up from sharpening a pickaxe. His eyes are hard as the mountain rock around him.* Stop right there, stranger. You're on Freeminer land. State your business, or turn around and walk back the way you came.",
      expression: 'suspicious',
      choices: [
        {
          text: "I mean no harm. I'm looking for Samuel Ironpick.",
          nextNodeId: 'looking_for_samuel',
        },
        {
          text: "Sheriff Cole sent me. There's been disappearances.",
          nextNodeId: 'sheriff_sent',
          conditions: [{ type: 'quest_active', target: 'investigate_disappearances' }],
        },
        {
          text: 'I came to trade. Your people might need supplies.',
          nextNodeId: 'trade_offer',
        },
        {
          text: "I'll leave. Sorry to intrude.",
          nextNodeId: 'leave_peacefully',
        },
      ],
    },
{
      id: 'looking_for_samuel',
      text: "*He sets down the pickaxe but keeps one hand near it* You found him. Question is, what do you want with an old miner who's got nothin' left to take? If IVRC sent you, save your breath. I ain't sellin'. Not today, not ever.",
      expression: 'guarded',
      choices: [
        {
          text: "IVRC didn't send me. I'm here about a letter.",
          nextNodeId: 'about_the_letter',
        },
        {
          text: "I've heard you lead the Freeminers. I want to help.",
          nextNodeId: 'want_to_help',
        },
        {
          text: "People in town speak well of you. I was curious.",
          nextNodeId: 'curious_visitor',
        },
      ],
    },
{
      id: 'about_the_letter',
      text: "*His eyes narrow dangerously* A letter. *He stands slowly, his full height still impressive despite his age* What kind of letter? And who told you to bring it here?",
      expression: 'intense',
      choices: [
        {
          text: 'A letter with a gear symbol. It led me to your old house on Copper Street.',
          nextNodeId: 'gear_letter_response',
        },
        {
          text: "It's unsigned. Mentions an inheritance at 14 Copper Street.",
          nextNodeId: 'copper_street_response',
        },
      ],
    },
{
      id: 'gear_letter_response',
      text: "*He goes very still. His weathered hand trembles slightly.* The gear. *He sits down heavily on a rock* I haven't seen that mark used in years. Not since the Alliance fell. *He looks up at you with different eyes* Who are you? Who are your people?",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_saw_gear' }],
      choices: [
        {
          text: "I don't know who sent it. I came here to find out.",
          nextNodeId: 'dont_know_sender',
        },
        {
          text: 'I think it was sent by family. But I need your help to understand why.',
          nextNodeId: 'family_sent',
        },
      ],
    },
{
      id: 'copper_street_response',
      text: "Copper Street. *His jaw tightens* That was my home. For twenty years, that house held my family, my memories, my... *He stops* It burned. IVRC's people burned it. And now someone's sendin' letters about it? *He studies you* Why would someone send you to a pile of ashes?",
      choices: [
        {
          text: "That's what I'm trying to figure out. I found a partial manifest in the ruins.",
          nextNodeId: 'manifest_found',
          conditions: [{ type: 'has_item', target: 'item_partial_manifest' }],
        },
        {
          text: "I don't know. I was hoping you could tell me.",
          nextNodeId: 'dont_know_sender',
        },
      ],
    },
{
      id: 'manifest_found',
      text: "*He snatches the manifest from your hand, reads it with trembling fingers* This... this is from the lockbox. Under the floorboards. I thought everything burned. *He looks at you with an expression between hope and terror* It mentions The Old Works. Do you know what that means?",
      expression: 'intense',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_confirmed_manifest' }],
      choices: [
        {
          text: 'No. What are The Old Works?',
          nextNodeId: 'old_works_explanation',
        },
        {
          text: "I've heard rumors. Something underground that IVRC found.",
          nextNodeId: 'underground_knowledge',
          conditions: [{ type: 'flag_set', target: 'miguel_suspects_ivrc_secret' }],
        },
      ],
    },
{
      id: 'old_works_explanation',
      text: "*He looks around to make sure no one is listening, then drops his voice* Deep under the Iron Mountains, there's somethin'. Not a mine. Not a cave. Somethin' built. Metal walls, corridors, machines that still hum after God knows how many centuries. IVRC found it five years ago. That's when everything changed.",
      expression: 'grave',
      onEnterEffects: [{ type: 'set_flag', target: 'knows_old_works_secret' }],
      choices: [
        {
          text: "You've seen it yourself?",
          nextNodeId: 'seen_it',
        },
        {
          text: "That's why they want the mining claims.",
          nextNodeId: 'claims_connection',
        },
        {
          text: 'What kind of machines?',
          nextNodeId: 'what_machines',
        },
      ],
    },
{
      id: 'seen_it',
      text: "Once. My son Jacob found it first. A tunnel he was digging broke through into... somethin' else. Smooth walls, like nothin' I'd ever seen. He showed me before he told anyone else. *His voice cracks* I told him to seal it up. To forget about it. He didn't listen. Three weeks later, IVRC knew about it. A month after that, Jacob was dead.",
      expression: 'grief',
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_told_jacob_story' }],
      choices: [
        {
          text: 'IVRC killed him?',
          nextNodeId: 'jacob_death',
        },
        {
          text: "I'm sorry about your son.",
          nextNodeId: 'sorry_for_son',
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'jacob_death',
      text: "Mine collapse. 'Structural failure,' they called it. In a tunnel my family had worked for ten years without a problem. And the only section that collapsed was the one nearest to the breakthrough into The Old Works. *He pounds his fist on his knee* They murdered my boy and called it an accident.",
      expression: 'angry',
      choices: [
        {
          text: 'Do you have proof?',
          nextNodeId: 'proof_of_murder',
        },
        {
          text: "They can't get away with this forever.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'proof_of_murder',
      text: "I have documents. Safety reports I copied before the originals disappeared. Testimony from miners who saw IVRC engineers weakening the supports. Letters between Thorne and his foreman discussing 'the Ironpick problem.' *He meets your eyes* I have proof enough to hang Cornelius Thorne. But proof means nothin' if there's no one honest enough to act on it.",
      onEnterEffects: [{ type: 'set_flag', target: 'samuel_mentioned_proof' }],
      choices: [
        {
          text: 'Where are these documents?',
          nextNodeId: 'documents_location',
        },
        {
          text: "I'll help you get that proof to the right people.",
          nextNodeId: 'help_with_proof',
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'documents_location',
      text: "*He shakes his head* I ain't tellin' you that. Not yet. I've had too many 'friends' who turned out to be IVRC informants. The documents are safe. They'll stay safe until I'm sure - absolutely sure - that they'll reach someone who can use 'em right.",
      choices: [
        {
          text: 'What would it take to earn your trust?',
          nextNodeId: 'earn_trust',
        },
        {
          text: 'I understand your caution.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'earn_trust',
      text: "*He looks you up and down* Actions, not words. My people are hurtin'. We need supplies - food, medicine, tools. We need protection from IVRC's claim jumpers who keep pushin' into our territory. Help us survive, and maybe - maybe - I'll believe you're not another snake.",
      onEnterEffects: [{ type: 'start_quest', target: 'freeminer_trust' }],
      choices: [
        {
          text: "Tell me what you need. I'll get it.",
          nextNodeId: 'supply_needs',
        },
        {
          text: "I'll prove myself. Watch.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'supply_needs',
      text: "Medicine, first. Doc Chen knows what we need - copper lung treatments, bandages, antiseptic. If you can get supplies from him without IVRC's spies followin' you, that'd be a start. We also need blasting powder. The legitimate kind - our supplier in Junction City got shut down by IVRC's licensing board.",
      choices: [
        {
          text: "I'll talk to Doc Chen.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'samuel_needs_medicine' }],
        },
        {
          text: "Where can I find blasting powder?",
          nextNodeId: 'blasting_powder',
        },
      ],
    },
{
      id: 'blasting_powder',
      text: "There's a trader in Coppertown. Runs a side business out of the back of the general store. Goes by 'Powder Pete.' Tell him Samuel sent you, and he might not shoot you on sight. *He almost smiles* Might.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_powder_pete' }],
      choices: [
        {
          text: "Comforting. I'll find him.",
          nextNodeId: null,
        },
      ],
    },
];
