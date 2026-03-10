import type { DialogueNode } from '../../../schemas/npc.ts';

export const doc_chen_nodes_1: DialogueNode[] = [
{
      id: 'way_out',
      text: '*He leans in* There is. Father Miguel and I... we help people disappear. New names, passage to other territories. But it is risky work. IVRC does not like losing its labor supply. If you ever wish to help...',
      conditions: [],
      onEnterEffects: [{ type: 'set_flag', target: 'doc_underground_hint' }],
      choices: [
        {
          text: 'I might be interested.',
          nextNodeId: 'underground_interest',
        },
        {
          text: "That's not my concern.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'underground_interest',
      text: 'Good. We can discuss it more another time. For now, know that your willingness to help does not go unnoticed. *He nods toward a side door* When you are ready, there is much to be done.',
      onEnterEffects: [
        { type: 'set_flag', target: 'can_join_underground' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: "I'll be back.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'history',
      text: 'Thirty years in this territory. I came when the railroad was just a dream and the only law was what a man carried on his hip. I have watched Dusty Springs grow from a water stop to a town. Whether that is progress... some days I wonder.',
      choices: [
        {
          text: "You've seen a lot of change.",
          nextNodeId: 'seen_change',
        },
        {
          text: 'What was it like before IVRC?',
          nextNodeId: 'before_ivrc',
        },
      ],
    },
{
      id: 'seen_change',
      text: 'Change is the only constant. When I arrived, the greatest danger was the land itself - heat, drought, rattlesnakes. Now the danger wears suits and carries contracts. Perhaps that is civilization.',
      choices: [
        {
          text: 'A cynical view.',
          nextNodeId: 'cynical_view',
        },
        {
          text: 'You prefer the old days?',
          nextNodeId: 'old_days',
        },
      ],
    },
{
      id: 'cynical_view',
      text: 'Realistic. Cynicism is the refuge of those who expected too much. I simply observe what is. *He shrugs* But I still believe in healing. That has not changed.',
      choices: [
        {
          text: 'Fair enough.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'old_days',
      text: "I prefer people being honest about what they are. A bandit with a gun is straightforward. A corporation that steals through paperwork while calling it 'progress'... that I find harder to stomach.",
      choices: [
        {
          text: 'An interesting perspective.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'before_ivrc',
      text: 'Harder, but simpler. People mined their own claims, ran their own ranches. The strong survived, yes, but there was opportunity for anyone willing to work. Now IVRC owns the opportunity, and doles it out as they see fit.',
      choices: [
        {
          text: 'Progress has its price.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'medical_supplies',
      text: '*He gestures to his shelves* I have tonics for general wellness, bandages, antiseptic herbs. For more serious injuries, I can treat you here. My prices are fair - I ask only what people can afford.',
      choices: [
        {
          text: 'What do you recommend for travelers?',
          nextNodeId: 'travel_supplies',
        },
        {
          text: "I'm not injured, just preparing.",
          nextNodeId: 'preparing',
        },
        {
          text: '[Browse Shop] Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'doc_chen_shop' }],
          tags: ['shop'],
        },
        {
          text: 'Maybe later. Thank you.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'travel_supplies',
      text: "A healing tonic or two. Bandages for minor wounds. If you're heading into rough country, a snakebite kit. The western desert is full of rattlers, and the antivenom is not cheap to make.",
      choices: [
        {
          text: "I'll take your advice.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'ready_to_shop_doc' }],
        },
      ],
    },
{
      id: 'preparing',
      text: 'Wise. Most who come to me wait until they are bleeding or feverish. Prevention is always better than cure. What manner of dangers do you expect to face?',
      choices: [
        {
          text: 'The usual - bandits, wildlife.',
          nextNodeId: 'usual_dangers',
        },
        {
          text: "I'm not sure yet.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'usual_dangers',
      text: 'Then you will want basic supplies. I will prepare a kit for you. *He begins gathering items* Though I should warn you - the most dangerous things in this territory do not attack with claws or guns. Watch for those who smile while they stab.',
      choices: [
        {
          text: 'Anyone in particular?',
          nextNodeId: 'who_to_watch',
        },
        {
          text: "I'll be careful. Thank you.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'who_to_watch',
      text: "The Mayor means well but serves IVRC's interests. The railroad's agents pass through regularly - they are friendly until they are not. And there are... others. People who gather information for coin. Trust is earned here, not given.",
      choices: [
        {
          text: 'Noted. I appreciate the warning.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'information_seeker',
      text: '*He pauses his work and studies you carefully* A doctor hears many things. Patients speak freely when they are in pain or fear. But I am no gossip. What, specifically, do you wish to know?',
      expression: 'suspicious',
      choices: [
        {
          text: "I'm looking for information about a letter I received.",
          nextNodeId: 'letter_info',
        },
        {
          text: "I'm interested in the power dynamics here.",
          nextNodeId: 'power_dynamics',
        },
        {
          text: "Nevermind. I shouldn't have asked.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'letter_info',
      text: 'A letter? *His eyes sharpen with interest* Many letters pass through this town. Some carry good news. Others... summon the dead. What did this letter say?',
      choices: [
        {
          text: 'It was signed with a gear symbol.',
          nextNodeId: 'gear_knowledge',
        },
        {
          text: "I'd rather not say.",
          nextNodeId: 'letter_secretive',
        },
      ],
    },
{
      id: 'gear_knowledge',
      text: "*He inhales sharply* The gear. I have not seen that mark in years. It was the symbol of the workers' alliance, before IVRC crushed them. If someone is using it again... *He trails off* Who gave you this letter?",
      onEnterEffects: [{ type: 'set_flag', target: 'doc_knows_gear_symbol' }],
      choices: [
        {
          text: "I don't know. It was unsigned.",
          nextNodeId: 'unsigned_letter',
        },
        {
          text: 'Why is the symbol significant?',
          nextNodeId: 'gear_significance',
        },
      ],
    },
{
      id: 'unsigned_letter',
      text: "Then someone is being careful. Good. The gear marked the Freeminer resistance - those who fought IVRC's stranglehold on the territory. Most of their leaders are dead or in hiding now. If that symbol is appearing again... something is stirring.",
      choices: [
        {
          text: 'What should I do?',
          nextNodeId: 'what_to_do',
        },
      ],
    },
{
      id: 'what_to_do',
      text: 'Follow the thread carefully. Someone wanted you here for a reason. Perhaps they see in you what they need. A fresh face, unconnected to the factions. Be that person - but be careful. Those who play between powers often get crushed between them.',
      choices: [
        {
          text: 'Thank you, Doc. This helps.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'gear_significance',
      text: 'The gear represented the workers - the gears of industry that made the railroad rich while staying poor themselves. When the alliance was betrayed, IVRC made the symbol illegal. Wearing it was grounds for arrest. Using it now is either brave or foolish.',
      choices: [
        {
          text: 'Brave and foolish often look the same.',
          nextNodeId: 'brave_foolish',
        },
      ],
    },
];
