import type { DialogueNode } from '../../../schemas/npc.ts';

export const mayor_holt_nodes_4: DialogueNode[] = [
{
      id: 'latest_developments',
      text: "IVRC is pressuring me for more building permits on the west side of town. They want to expand their freight depot. It would mean tearing down three homesteads. *She rubs her temples* And the Copperheads hit another payroll shipment last Tuesday. Thorne is furious.",
      choices: [
        {
          text: 'Will you approve the permits?',
          nextNodeId: 'permit_dilemma',
        },
        {
          text: 'The Copperhead raids are escalating.',
          nextNodeId: 'copperhead_damage',
        },
        {
          text: "Difficult times. I hope you manage.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'permit_dilemma',
      text: "I'm stalling. Adding conditions, requesting environmental assessments, demanding impact studies. It won't last forever, but every week those families have their homes is a week I've won. *She smiles thinly* Bureaucracy has its uses.",
      choices: [
        {
          text: "Fighting fire with paperwork. I respect that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'ivrc_operations_rumor',
      text: "*She closes the door to her office* What have you heard? And from whom?",
      expression: 'alert',
      choices: [
        {
          text: 'People talk about safety violations, covered-up deaths.',
          nextNodeId: 'safety_violations',
        },
        {
          text: "I'd rather not say who told me.",
          nextNodeId: 'protect_source',
        },
      ],
    },
{
      id: 'safety_violations',
      text: "*She nods slowly* I've heard the same. Seen some of it myself, when I visited the Coppertown operations. Conditions that would shut down any mine back east. But out here, territorial law is... flexible. And the inspectors answer to Thorne.",
      choices: [
        {
          text: 'Proof could change that.',
          nextNodeId: 'proof_discussion',
        },
        {
          text: 'How do you live with knowing?',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'questioned_mayor_conscience' }],
        },
      ],
    },
{
      id: 'proof_discussion',
      text: "The right proof, in the right hands... yes. Federal oversight, eastern newspapers, territorial reform. It's happened before in other territories. But the proof has to be ironclad. Thorne's lawyers can shred anything less. *She meets your eyes* If you find something solid, bring it to me. I may not be able to act openly, but I have connections.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_will_use_evidence' }],
      choices: [
        {
          text: "I'll see what I can find.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'protect_source',
      text: "*She nods* Smart. In this town, protecting your sources is survival. Just know that whatever you've heard, it's probably worse than you think. IVRC is very good at hiding the full scope of their operations.",
      choices: [
        {
          text: 'Then I need to dig deeper.',
          nextNodeId: null,
        },
      ],
    },
{
      id: 'inheritance_discussion',
      text: "*Mayor Holt sets down her pen* I've been thinking about your situation. The Ironpick property, the letter, all of it. Have you made any progress?",
      choices: [
        {
          text: "I've been investigating. Found some things.",
          nextNodeId: 'progress_report',
        },
        {
          text: 'Not yet. Any advice?',
          nextNodeId: 'mayor_advice',
        },
        {
          text: "I'm handling it. Is there anything else?",
          nextNodeId: 'town_governance',
        },
      ],
    },
{
      id: 'progress_report',
      text: "*She leans forward* What have you found? And please - be careful what you share with others. Not everyone in this town can be trusted.",
      choices: [
        {
          text: 'The fire was arson, just as we suspected.',
          nextNodeId: 'arson_confirmed',
          conditions: [{ type: 'flag_set', target: 'found_arson_evidence' }],
        },
        {
          text: "I'm still piecing things together.",
          nextNodeId: 'mayor_advice',
        },
      ],
    },
{
      id: 'arson_confirmed',
      text: "I'm not surprised, but hearing it confirmed... *She shakes her head* Ashworth's work, no doubt. She was in town that week with a team of 'surveyors.' *She emphasizes the word with disgust* If you can link her directly to the fire, that's the kind of evidence that could matter.",
      choices: [
        {
          text: "I'll keep looking.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },
{
      id: 'mayor_advice',
      text: "My advice? Talk to Father Miguel. He knows more about the underground history of this territory than anyone alive. And he's one of the few people I'd trust with my life. He and Doc Chen both. If you haven't visited them yet, you should.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_recommended_miguel' }],
      choices: [
        {
          text: "I'll pay them a visit.",
          nextNodeId: null,
        },
        {
          text: 'Thank you, Mayor.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },
{
      id: 'post_investigation',
      text: "*Mayor Holt closes her office door behind you* I heard you found something in the ruins. *She keeps her voice low* The walls have ears in this town. Tell me quickly - what did the manifest say?",
      expression: 'urgent',
      choices: [
        {
          text: "It mentions 'The Old Works' - some kind of location.",
          nextNodeId: 'old_works_reaction',
        },
        {
          text: "I'd rather not share the details yet.",
          nextNodeId: 'withholding_info',
        },
      ],
    },
{
      id: 'old_works_reaction',
      text: "*Her eyes widen* The Old Works. I've heard that name once before, from my husband, the night before he died. He said it was something IVRC found underground - something they built their whole operation around. He never got to explain what it was.",
      expression: 'shocked',
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_knows_old_works' }],
      choices: [
        {
          text: 'Your husband knew about this?',
          nextNodeId: 'thomas_knew',
        },
        {
          text: 'Something underground... the miners have seen things too.',
          nextNodeId: 'underground_connection',
        },
      ],
    },
{
      id: 'thomas_knew',
      text: "He knew something. Not everything. He was trying to find out more when... when the accident happened. *She steadies herself* Whatever The Old Works is, IVRC considers it valuable enough to kill for. That makes it valuable enough to fight for.",
      choices: [
        {
          text: "I'll find out what it is.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 15 }],
        },
      ],
    },
{
      id: 'underground_connection',
      text: "Metal walls underground. Strange sounds. Miners who disappear. *She connects the dots* The Old Works isn't a metaphor. It's a real place, under the mountains. And IVRC found it. *She looks frightened* That's why they want the mining claims so badly. It was never about copper.",
      onEnterEffects: [{ type: 'set_flag', target: 'mayor_suspects_old_works_location' }],
      choices: [
        {
          text: "This changes everything.",
          nextNodeId: null,
        },
      ],
    },
{
      id: 'withholding_info',
      text: "*She nods, though frustration flickers across her face* I understand caution. But remember - I've risked a great deal sharing what I know with you. Trust is a two-way bridge, stranger. When you're ready to cross it, you know where to find me.",
      choices: [
        {
          text: "I'll share more when I know more.",
          nextNodeId: null,
        },
      ],
    },
];
