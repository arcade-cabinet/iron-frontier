import type { DialogueNode } from '../../../schemas/npc.ts';

export const doc_chen_nodes_0: DialogueNode[] = [
{
      id: 'first_meeting',
      text: '*A weathered man with keen eyes looks up from grinding herbs* Ah, a new face in Dusty Springs. I am Chen Wei - most call me Doc. You appear healthy enough, which is unusual for travelers on these roads. What brings you to my practice?',
      expression: 'curious',
      choices: [
        {
          text: 'Just looking around. Nice to meet you.',
          nextNodeId: 'polite_intro',
        },
        {
          text: 'I might need medical supplies.',
          nextNodeId: 'medical_supplies',
        },
        {
          text: 'I hear you know things about this town.',
          nextNodeId: 'information_seeker',
        },
      ],
    },
{
      id: 'polite_intro',
      text: 'And you as well. *He sets down his mortar and pestle* Forgive the mess - I was preparing a tonic for the miners. The dust in their lungs... it is a slow killer. But such is life on the frontier. Everything here takes its toll.',
      choices: [
        {
          text: 'You treat the miners?',
          nextNodeId: 'miner_treatment',
        },
        {
          text: 'You seem well-established here.',
          nextNodeId: 'history',
        },
        {
          text: 'I should let you work.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'miner_treatment',
      text: "Those who can afford it, or those who cannot and need it anyway. *He smiles slightly* IVRC's company doctors are... selective in their care. A man who asks too many questions about safety finds himself suddenly ineligible for treatment. So they come to me.",
      choices: [
        {
          text: "That sounds like you're taking a risk.",
          nextNodeId: 'doc_risk',
        },
        {
          text: 'How bad are the conditions?',
          nextNodeId: 'mine_conditions',
        },
      ],
    },
{
      id: 'doc_risk',
      text: '*He shrugs* All medicine is risk. The risk of action, the risk of inaction. I came to this country to practice healing, not to serve corporations. If IVRC wishes to silence me... *he gestures to the shelves of remedies* ...they will find I am useful to too many people.',
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'Brave of you.',
          nextNodeId: 'brave_response',
        },
        {
          text: 'Or foolish.',
          nextNodeId: 'foolish_response',
        },
      ],
    },
{
      id: 'brave_response',
      text: 'Practical, I would say. *He returns to his work* A doctor who only heals the wealthy is not much of a doctor at all. Now - is there something specific I can help you with?',
      choices: [
        {
          text: "Tell me about the miners' conditions.",
          nextNodeId: 'mine_conditions',
        },
        {
          text: "I'd like to buy some supplies.",
          nextNodeId: 'medical_supplies',
        },
        {
          text: 'Not right now. Thank you, Doc.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'foolish_response',
      text: '*He chuckles* Perhaps. But I have outlived wiser men by being useful. In my experience, the foolish are those who believe they have nothing left to learn. Are you such a person?',
      choices: [
        {
          text: "I'm always learning.",
          nextNodeId: 'learning_response',
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'I know what I need to know.',
          nextNodeId: 'know_it_all',
          effects: [{ type: 'change_reputation', value: -5 }],
        },
      ],
    },
{
      id: 'learning_response',
      text: 'Good. That will serve you well here. The frontier does not forgive ignorance. *He nods approvingly* If you have questions about this town or its people, you may ask. I have been here long enough to see much.',
      choices: [
        {
          text: 'What should I know about Dusty Springs?',
          nextNodeId: 'town_overview',
        },
        {
          text: "I'll remember that. Thank you.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'know_it_all',
      text: 'Mm. *He returns to his herbs without further comment* Then I wish you well. My door is open should you reconsider.',
      choices: [
        {
          text: 'Fine.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'mine_conditions',
      text: "IVRC's operations care nothing for the workers. Twelve-hour shifts in tunnels thick with copper dust. No ventilation, no safety rails. When the ceiling collapses, they count it as 'acceptable loss' and hire the next desperate soul. I treat what I can, but many are beyond help by the time they reach me.",
      expression: 'sad',
      choices: [
        {
          text: 'Can nothing be done?',
          nextNodeId: 'what_can_be_done',
        },
        {
          text: 'Why do people work there?',
          nextNodeId: 'why_work_there',
        },
      ],
    },
{
      id: 'what_can_be_done',
      text: 'The Freeminers fight for better conditions. The Copperheads rob IVRC to hurt their profits. Father Miguel gives spiritual comfort. I... I heal who I can, and I listen. Sometimes, listening is medicine itself.',
      choices: [
        {
          text: 'And the law?',
          nextNodeId: 'law_opinion',
        },
        {
          text: 'There must be evidence of wrongdoing.',
          nextNodeId: 'evidence_question',
        },
      ],
    },
{
      id: 'law_opinion',
      text: 'Sheriff Cole is a good man, but his badge comes from authorities that answer to IVRC. He investigates what he can, arrests who he must. But systemic change? That requires power he does not possess. *He lowers his voice* Or evidence that cannot be ignored.',
      onEnterEffects: [{ type: 'set_flag', target: 'doc_mentioned_evidence' }],
      choices: [
        {
          text: 'What kind of evidence?',
          nextNodeId: 'evidence_question',
        },
        {
          text: 'I understand. Thank you for your candor.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'evidence_question',
      text: '*He glances toward the door, then speaks quietly* There were documents. Records of safety violations, bribes, deaths covered up. The Ironpick family had copies. Then their house burned, and they fled to the mountains. If those documents still exist...',
      onEnterEffects: [{ type: 'set_flag', target: 'doc_told_about_documents' }],
      choices: [
        {
          text: 'Where might they be?',
          nextNodeId: 'document_location',
        },
        {
          text: "That's dangerous knowledge.",
          nextNodeId: 'dangerous_knowledge',
        },
      ],
    },
{
      id: 'document_location',
      text: "Old Samuel Ironpick took his family to Freeminer's Hollow when IVRC's men came for them. If anyone knows where the evidence is hidden, it would be him. But he trusts no one now. Too many have tried to buy or steal what he knows.",
      choices: [
        {
          text: 'How could someone earn his trust?',
          nextNodeId: 'earn_trust',
        },
        {
          text: "I'll look into it.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'seeking_ironpick_docs' }],
        },
      ],
    },
{
      id: 'earn_trust',
      text: 'Help his people without asking for anything in return. Protect them from claim jumpers. Bring them supplies they cannot get. Show that you value their cause, not just their secrets. Words mean nothing to Samuel. Only actions.',
      choices: [
        {
          text: 'Thank you for the guidance, Doc.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'dangerous_knowledge',
      text: 'All knowledge is dangerous. The question is what one does with it. *He meets your eyes* You seem like someone who might do something worthwhile. But that is for you to decide, not me.',
      choices: [
        {
          text: 'I appreciate your discretion.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'why_work_there',
      text: 'Because the alternative is starving. IVRC controls the water rights, the stores, the credit. A man in debt to the company store works where the company says, for wages the company sets. It is not so different from the bondage my grandfather fled.',
      expression: 'thoughtful',
      choices: [
        {
          text: 'There must be a way out.',
          nextNodeId: 'way_out',
        },
        {
          text: "I'm sorry to hear that.",
          nextNodeId: null,
        },
      ],
    },
];
