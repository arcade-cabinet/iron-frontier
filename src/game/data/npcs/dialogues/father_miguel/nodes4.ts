import type { DialogueNode } from '../../../schemas/npc.ts';

export const father_miguel_nodes_4: DialogueNode[] = [
{
      id: 'mine_safety',
      text: "Doc Chen documents what he can. I write letters to the territorial authorities. Sheriff Cole files reports. All of it disappears into a bureaucratic void. IVRC's lawyers are very efficient at making complaints vanish. Without hard evidence - the kind that can't be buried - nothing changes.",
      choices: [
        {
          text: 'There must be evidence somewhere.',
          nextNodeId: 'evidence_destroyed',
        },
        {
          text: "Don't lose hope.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'church_purpose',
      text: "This church is many things. A place of worship, yes. But also a school, a hospital when Doc Chen's office overflows, a shelter in storms. *He lowers his voice* And sometimes... a hiding place for those who have nowhere else to go.",
      choices: [
        {
          text: 'A hiding place?',
          nextNodeId: 'lawbreaking_hint',
        },
        {
          text: "A church that serves its community. As it should be.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'open_to_all',
      text: "Rare, yes. But necessary. IVRC divides people - by race, by language, by how much they owe the company store. In this church, the Chinese miner sits beside the Mexican farmer sits beside the American rancher. We are all equal before God and before the frontier.",
      choices: [
        {
          text: "That's a powerful statement in a divided town.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'Does IVRC approve of your open-door policy?',
          nextNodeId: 'ivrc_disapproval',
        },
      ],
    },
{
      id: 'ivrc_disapproval',
      text: "*He smiles* They tolerate it because shutting down a church would be bad for their reputation back east. Even Cornelius Thorne must maintain appearances. But there have been... suggestions. That I should preach more about the virtue of hard work and less about the rights of workers.",
      choices: [
        {
          text: "And you ignore those suggestions.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'return_greeting',
      text: "*Father Miguel looks up from his Bible with a warm smile* Ah, my friend returns. Come, sit. How are you? And I do not mean your body - Doc Chen can tend to that. How is your spirit?",
      expression: 'warm',
      choices: [
        {
          text: "Honestly? This territory weighs on me.",
          nextNodeId: 'spiritual_guidance',
        },
        {
          text: "I'm well. Any news from the underground?",
          nextNodeId: 'underground_news',
          conditions: [{ type: 'flag_set', target: 'knows_underground_railroad' }],
        },
        {
          text: 'I wanted to ask about the town history.',
          nextNodeId: 'town_history_interest',
        },
        {
          text: 'Just wanted to visit. This place is peaceful.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'spiritual_guidance',
      text: "*He nods knowingly* The frontier tests us all. It strips away pretense, leaves us face to face with what we truly are. That can be frightening. *He places a hand on your shoulder* But remember - you chose to be here. Whatever brought you, you chose to stay and fight. That says something about who you are.",
      choices: [
        {
          text: 'Do you ever doubt, Father?',
          nextNodeId: 'miguel_doubts',
        },
        {
          text: 'Thank you. I needed to hear that.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'miguel_doubts',
      text: "Every day. *He laughs gently* A priest who does not doubt is not thinking. I doubt my choices, my courage, my ability to make a difference. But then I see a child I helped bring into this world, or a worker who escaped because of our underground... and the doubt fades. Purpose is the antidote to doubt.",
      expression: 'thoughtful',
      choices: [
        {
          text: "Wise words.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'underground_news',
      text: "*He moves closer, speaking quietly* We moved three families last week. All safe, thank God. But IVRC has increased patrols on the northern road. Someone is informing on us - or they are simply tightening control everywhere. Either way, it is getting harder.",
      choices: [
        {
          text: 'Do you need help with anything?',
          nextNodeId: 'help_needed',
        },
        {
          text: 'Be careful, Father.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'help_needed',
      text: "Always. We need supplies at the safe house north of town. And there is a woman at the Coppertown company barracks who wants out - she has two children. If you are heading that direction... *He presses a folded note into your hand* Give her this. She will know what it means.",
      onEnterEffects: [{ type: 'give_item', target: 'miguels_note' }],
      choices: [
        {
          text: "I'll see it done.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'trusted_greeting',
      text: "*Father Miguel embraces you warmly* Mi amigo! It is good to see you. The Lord's work continues because of people like you. Come - I have fresh coffee, and there is much to discuss.",
      expression: 'joyful',
      choices: [
        {
          text: 'Good to see you too, Father. What news?',
          nextNodeId: 'trusted_news',
        },
        {
          text: "I could use your counsel.",
          nextNodeId: 'spiritual_guidance',
        },
        {
          text: "How's the underground?",
          nextNodeId: 'underground_news',
        },
      ],
    },
{
      id: 'trusted_news',
      text: "The wind is changing, friend. I feel it. More people are speaking up, quietly. The fear that IVRC built is cracking. And the evidence you have been gathering... it gives people hope. Hope is the most dangerous weapon against tyranny.",
      choices: [
        {
          text: "We're not done yet. But we're getting closer.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'underground_active',
      text: "*Father Miguel hurries to meet you, anxiety etched on his face* Thank God you're here. We have a situation. Have you made progress with the sanctuary work?",
      expression: 'anxious',
      choices: [
        {
          text: "I'm working on it. What's the situation?",
          nextNodeId: 'sanctuary_update',
        },
        {
          text: "The family is safe. I got them through.",
          nextNodeId: 'family_safe',
          conditions: [{ type: 'flag_set', target: 'sanctuary_family_rescued' }],
        },
      ],
    },
{
      id: 'sanctuary_update',
      text: "IVRC enforcers are getting closer to the northern safe house. We may need to move our route. And Doc Chen says he is running low on the medicines we send with the families. If you can help with either of these things...",
      choices: [
        {
          text: "I'll handle the safe house first.",
          nextNodeId: null,
        },
        {
          text: "I'll get Doc Chen the supplies he needs.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'family_safe',
      text: "*His face floods with relief, and he clasps your hands* Gracias a Dios. Thank you, my friend. You have saved lives today. Those children will grow up free because of what you did. *His eyes glisten* That is worth more than all the gold in these mountains.",
      expression: 'joyful',
      onEnterEffects: [
        { type: 'change_reputation', value: 20 },
        { type: 'advance_quest', target: 'sanctuary' },
      ],
      choices: [
        {
          text: "Anyone would have done the same.",
          nextNodeId: null,
        },
        {
          text: "Don't thank me yet. There are more families to save.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'dedicated_to_underground' }],
        },
      ],
    },
{
      id: 'alliance_rebuild',
      text: "*His eyes light up with a fire that seems almost too young for his weathered face* Rebuilt? That is the dream I carry in my heart every day. If the Copperheads, the Freeminers, and the townfolk could unite again... IVRC could not stand against them. But it would take a miracle. Or perhaps... just the right person.",
      choices: [
        {
          text: "Then let's make that miracle happen.",
          nextNodeId: 'be_the_bridge',
        },
        {
          text: "One step at a time.",
          nextNodeId: null,
        },
      ],
    },
];
