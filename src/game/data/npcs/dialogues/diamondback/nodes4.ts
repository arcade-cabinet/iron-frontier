import type { DialogueNode } from '../../../schemas/npc.ts';

export const diamondback_nodes_4: DialogueNode[] = [
{
      id: 'partial_trust',
      text: "*She almost smiles* Partial trust. That's honest, at least. Most people either lie about trusting completely or lie about not trusting at all. *She nods* Alright. You've got my attention. Talk.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'I want to fight IVRC.',
          nextNodeId: 'want_to_fight',
        },
        {
          text: "I'm looking for information about the gear symbol.",
          nextNodeId: 'gear_question',
        },
      ],
    },
{
      id: 'calculated',
      text: "Cold. I like cold. *She gestures toward the camp* Come on. Anyone stupid enough to walk into a outlaw camp alone deserves to at least hear what we're about before dyin'.",
      choices: [
        {
          text: 'I appreciate the hospitality.',
          nextNodeId: 'copperhead_mission',
        },
      ],
    },
{
      id: 'gear_question',
      text: '*She goes very still* Where did you hear about that symbol?',
      expression: 'serious',
      choices: [
        {
          text: 'I have a letter marked with it.',
          nextNodeId: 'gear_reveal',
          conditions: [{ type: 'has_item', target: 'mysterious_letter' }],
        },
        {
          text: 'Doc Chen mentioned it.',
          nextNodeId: 'doc_gear_mention',
        },
      ],
    },
{
      id: 'doc_gear_mention',
      text: "Doc's got a long memory. *She relaxes slightly* The gear was the workers' symbol, back when there was still hope of peaceful change. IVRC destroyed that hope. Now the symbol's just a ghost... unless someone's tryin' to resurrect it.",
      choices: [
        {
          text: 'Maybe someone is.',
          nextNodeId: 'resurrection',
        },
      ],
    },
{
      id: 'resurrection',
      text: "*She studies you intently* If that's true... it changes things. The old guard, the Freeminers, even my people - we could unite under that symbol. But it would take something real. Proof that IVRC can be beaten.",
      choices: [
        {
          text: 'Like the Ironpick documents?',
          nextNodeId: 'documents_alliance',
        },
        {
          text: 'Like a decisive strike against their operations?',
          nextNodeId: 'decisive_strike',
        },
      ],
    },
{
      id: 'decisive_strike',
      text: "Blood gets attention, but it don't change laws. *She shakes her head* If you want to really hurt IVRC, you need to expose 'em. Make even their bought politicians distance themselves. Violence just makes martyrs - theirs and ours.",
      choices: [
        {
          text: 'The documents, then.',
          nextNodeId: 'documents_alliance',
        },
      ],
    },
{
      id: 'trusted_greeting',
      text: "*Diamondback rises from her seat with something approaching a smile* Look who's back. My people say you've been busy. Causin' trouble for IVRC, from what I hear. That sits well with me.",
      expression: 'friendly',
      choices: [
        {
          text: 'Just doing what needs done.',
          nextNodeId: 'humble_response',
        },
        {
          text: 'Any news from your end?',
          nextNodeId: 'copperhead_news',
        },
        {
          text: 'I may have a lead on those documents.',
          nextNodeId: 'documents_lead',
          conditions: [{ type: 'flag_set', target: 'found_document_clue' }],
        },
      ],
    },
{
      id: 'humble_response',
      text: "Humble too. Don't see that often in this line of work. *She claps your shoulder* Keep it up. You're makin' friends in the right places and enemies in the right places. That's the sign of someone who knows what they're doin'.",
      choices: [
        {
          text: "What's our next move?",
          nextNodeId: 'next_move',
        },
      ],
    },
{
      id: 'next_move',
      text: "IVRC's bringin' in more enforcers. Victoria Ashworth's supposed to be somewhere in the territory now. Things are heatin' up. We need to be ready for whatever comes.",
      choices: [
        {
          text: "I'll keep my eyes open.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'copperhead_news',
      text: "Same old dance. We hit a supply wagon last week - nothin' major, but it'll keep us fed. IVRC's bringin' in more guards from the east. And there's talk of Victoria Ashworth herself comin' to 'clean up' the territory. Means they're scared.",
      choices: [
        {
          text: 'Scared is good.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'documents_lead',
      text: "*She straightens immediately* You found somethin'? Tell me everything.",
      expression: 'eager',
      choices: [
        {
          text: 'Samuel Ironpick has them hidden. I know where.',
          nextNodeId: 'documents_location',
        },
        {
          text: "I'm close. Need a bit more time.",
          nextNodeId: 'documents_patience',
        },
      ],
    },
{
      id: 'documents_location',
      text: "*She grabs your arm* Then we go get them. Now. Before IVRC realizes someone's close. My people can provide cover if needed.",
      onEnterEffects: [{ type: 'start_quest', target: 'retrieve_documents' }],
      choices: [
        {
          text: 'This needs to be quiet. Too many people will spook Samuel.',
          nextNodeId: 'quiet_approach',
        },
        {
          text: 'Backup would be good. Just in case.',
          nextNodeId: 'backup_approach',
        },
      ],
    },
{
      id: 'quiet_approach',
      text: "*She nods reluctantly* You know the old man better than I do. But the moment things go wrong, you send word. The Copperheads'll ride.",
      choices: [
        {
          text: "I'll get it done.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'backup_approach',
      text: "Silent Pete and two others'll shadow you. Stay out of sight unless needed. *She grins* Go get those documents. This could change everything.",
      onEnterEffects: [{ type: 'set_flag', target: 'copperhead_backup' }],
      choices: [
        {
          text: "Let's do this.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'documents_patience',
      text: "*She forces herself to sit back down* Alright. But don't take too long. Every day those documents stay hidden is another day IVRC gets stronger. Find 'em, and find 'em fast.",
      choices: [
        {
          text: "I won't let you down.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'return_greeting',
      text: "*Diamondback looks up from a map spread across a makeshift table* Back again. Got news, or just lookin' for trouble?",
      choices: [
        {
          text: "Checking in. What's the situation?",
          nextNodeId: 'situation_update',
        },
        {
          text: 'I might have a lead.',
          nextNodeId: 'lead_check',
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'situation_update',
      text: "IVRC's got the railroad locked down tighter than a drum. Harder to hit their shipments now. But they can't guard everything. We're still findin' soft spots. Just takes more planning.",
      choices: [
        {
          text: 'Anything I can help with?',
          nextNodeId: 'help_request',
        },
        {
          text: 'Stay safe out there.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'help_request',
      text: "There's always somethin'. But right now, the best thing you can do is keep workin' on whatever brought you here. The documents, Samuel, the gear symbol - that's the long game. We'll handle the short game.",
      choices: [
        {
          text: 'Understood.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'lead_check',
      text: "A lead on what? The documents? Victoria Ashworth? I'm all ears.",
      choices: [
        {
          text: 'Still working on it. Nothing solid yet.',
          nextNodeId: 'keep_working',
        },
      ],
    },
];
