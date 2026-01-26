/**
 * Professor Emmett Cogsworth - Dialogue Trees
 *
 * An eccentric inventor and former IVRC researcher. Dismissed for
 * "dangerous and impractical" ideas. Knows more about Project Remnant
 * than he lets on. Creates gadgets that range from brilliant to explosive.
 */

import type { DialogueTree } from '../../schemas/npc';

export const ProfessorCogsworthMainDialogue: DialogueTree = {
  id: 'professor_cogsworth_main',
  name: 'Professor Cogsworth - Main Conversation',
  description: 'Primary dialogue tree for Professor Emmett Cogsworth',
  tags: ['coldwater', 'inventor', 'gadgets', 'remnant_knowledge'],

  entryPoints: [
    {
      nodeId: 'first_meeting',
      conditions: [{ type: 'first_meeting' }],
      priority: 10,
    },
    {
      nodeId: 'has_parts_greeting',
      conditions: [{ type: 'has_item', target: 'rare_parts' }],
      priority: 8,
    },
    {
      nodeId: 'quest_active_greeting',
      conditions: [{ type: 'quest_active', target: 'cogsworths_contraption' }],
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
      text: "*A wild-haired man in a grease-stained coat looks up from a bewildering array of gears and tubes, spectacles magnifying his eyes to owlish proportions* Ah! A visitor! Excellent, excellent! Don't touch that - or that - definitely not that one, it's not stable yet. Now then, what brings you to my humble laboratory?",
      expression: 'excited',
      choices: [
        {
          text: "I'm looking for Professor Cogsworth.",
          nextNodeId: 'am_cogsworth',
        },
        {
          text: "What is all this equipment?",
          nextNodeId: 'equipment_explanation',
        },
        {
          text: "I heard you used to work for IVRC.",
          nextNodeId: 'ivrc_past',
        },
      ],
    },

    {
      id: 'am_cogsworth',
      text: "*He beams* You've found him! Professor Emmett Cogsworth, at your service. Inventor, engineer, and - according to IVRC - 'dangerous liability to corporate interests.' *He chuckles* As if innovation were dangerous! Well, sometimes it explodes, but that's beside the point. How can I help you?",
      choices: [
        {
          text: "I need some gadgets or equipment.",
          nextNodeId: 'need_gadgets',
        },
        {
          text: "I'm interested in your research.",
          nextNodeId: 'research_interest',
        },
        {
          text: 'What happened with IVRC?',
          nextNodeId: 'ivrc_past',
        },
      ],
    },

    {
      id: 'equipment_explanation',
      text: "*His eyes light up* This? This is the future! Steam-powered mechanisms, electrical amplification, automated processes! IVRC wanted to use these principles to extract resources faster. I wanted to use them to make lives better. We... disagreed. *He gestures proudly* Now I work for myself!",
      choices: [
        {
          text: 'What kind of things do you make?',
          nextNodeId: 'what_makes',
        },
        {
          text: 'IVRC fired you for wanting to help people?',
          nextNodeId: 'ivrc_fired',
        },
        {
          text: "It's certainly impressive.",
          nextNodeId: 'impressed',
        },
      ],
    },

    {
      id: 'what_makes',
      text: "Oh, all sorts! Automatic lock-pickers for when you lose your keys - not for burglary, mind you. Portable heating devices for winter travelers. Enhanced lanterns that never need oil. And my personal favorite - *he gestures to a large contraption* - a steam-powered digging machine! Still working out the... explosive tendencies.",
      choices: [
        {
          text: 'Could I buy some of your inventions?',
          nextNodeId: 'buy_inventions',
        },
        {
          text: 'Explosive tendencies?',
          nextNodeId: 'explosive_tendencies',
        },
        {
          text: 'Have you ever made weapons?',
          nextNodeId: 'weapons_question',
        },
      ],
    },

    {
      id: 'buy_inventions',
      text: "*He rubs his hands together* A customer! Wonderful! I have several stable - mostly stable - devices available. Though I should warn you, my work tends to be... unconventional. Standard warranties don't apply when steam pressure is involved.",
      choices: [
        {
          text: '[Browse Shop] Show me what you have.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'cogsworth_gadgets' }],
          tags: ['shop'],
        },
        {
          text: 'What do you recommend for self-defense?',
          nextNodeId: 'defense_items',
        },
        {
          text: 'Anything for exploration?',
          nextNodeId: 'exploration_items',
        },
      ],
    },

    {
      id: 'defense_items',
      text: "Self-defense? Hmm. I have a flash-bang device - blinds attackers temporarily with a burst of light and sound. Also a smoke-maker for quick escapes. And if you're feeling adventurous, there's the Spark Glove - electrical discharge on contact. *He wiggles his singed fingers* Still calibrating that one.",
      choices: [
        {
          text: '[Browse Shop] Let me see them.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'cogsworth_gadgets' }],
          tags: ['shop'],
        },
        {
          text: "I'll think about it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'exploration_items',
      text: "For exploration? Oh, I have wonderful things! Grappling hooks with auto-retract mechanisms. Breathing apparatus for toxic environments - the mines, for instance. Portable lighting that won't blow out in wind. And my newest creation - a device that detects underground cavities! Useful for finding hidden passages... or avoiding cave-ins.",
      choices: [
        {
          text: '[Browse Shop] Show me everything.',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'cogsworth_gadgets' }],
          tags: ['shop'],
        },
        {
          text: 'The cavity detector sounds useful.',
          nextNodeId: 'cavity_detector',
        },
      ],
    },

    {
      id: 'cavity_detector',
      text: "*He beams* Isn't it? I developed it originally for IVRC's mining operations, but they said it was 'too expensive per unit.' *He scoffs* As if worker safety had a price cap! Now I sell it to independent miners who actually value their lives. Thirty gold, and it's yours.",
      choices: [
        {
          text: '[Pay 30 gold] I will take it.',
          nextNodeId: 'buy_detector',
          effects: [{ type: 'take_gold', value: 30 }],
          conditions: [{ type: 'gold_gte', value: 30 }],
        },
        {
          text: 'Let me think about it.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'buy_detector',
      text: "*He carefully hands you a brass device with several dials* Simply point it at the ground and watch the needle. Steady means solid rock, fluctuation means a cavity below. The greater the fluctuation, the larger the space. Oh, and don't drop it - the calibration is... delicate.",
      onEnterEffects: [{ type: 'give_item', target: 'cavity_detector' }],
      choices: [
        {
          text: 'Thank you, Professor.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'explosive_tendencies',
      text: "*He waves dismissively* Merely a matter of pressure regulation! The concept is sound - use steam to power a rotating drill bit. Unfortunately, if the pressure builds too quickly... *He gestures to several scorch marks on the ceiling* Well. Trial and error is the foundation of progress!",
      choices: [
        {
          text: "Hasn't that been dangerous?",
          nextNodeId: 'dangerous_work',
        },
        {
          text: 'You seem remarkably calm about explosions.',
          nextNodeId: 'calm_about_explosions',
        },
      ],
    },

    {
      id: 'dangerous_work',
      text: "*He shows you his hands, covered in small burn scars* Occupational hazards. But every scar teaches a lesson! This one taught me about pressure valves. This one about electrical insulation. And this one... *He pauses* Actually, I'm not entirely sure what caused that one. Memory gets fuzzy after certain incidents.",
      choices: [
        {
          text: "You're dedicated to your work.",
          nextNodeId: 'dedication',
        },
        {
          text: 'Has anyone else been hurt?',
          nextNodeId: 'others_hurt',
        },
      ],
    },

    {
      id: 'dedication',
      text: "Dedicated? *He considers the word* I suppose I am. When you see what's possible - machines that could ease human suffering, devices that could make the impossible routine - how could you stop? IVRC wanted my mind for profit. I want to use it for... more.",
      onEnterEffects: [{ type: 'change_reputation', value: 5 }],
      choices: [
        {
          text: 'A noble goal.',
          nextNodeId: 'noble_goal',
        },
        {
          text: 'What more do you want to achieve?',
          nextNodeId: 'achieve_more',
        },
      ],
    },

    {
      id: 'noble_goal',
      text: "*He smiles wistfully* Nell - Dr. McAllister, the veterinarian - says I'm an idealist. Perhaps she's right. But ideals are just realities that haven't happened yet. *He gestures to his workshop* Every failure brings me closer to success. I just need to keep trying.",
      choices: [
        {
          text: "That's an inspiring perspective.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'achieve_more',
      text: "*His voice drops* Have you heard of the Analytical Engine? A machine that can think - not truly think, but process information, make calculations that would take humans years. I believe such a device could be built. IVRC laughed at me. But I've been working on the principles...",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_analytical_engine' }],
      choices: [
        {
          text: 'A thinking machine? Is that possible?',
          nextNodeId: 'thinking_machine',
        },
        {
          text: 'What would you do with such a device?',
          nextNodeId: 'use_for_device',
        },
      ],
    },

    {
      id: 'thinking_machine',
      text: "*He grows animated* Possible? It's inevitable! The human mind operates on principles - inputs, processes, outputs. If we can understand those principles, we can replicate them mechanically. Not consciousness, mind you - but calculation, pattern recognition, perhaps even... prediction.",
      choices: [
        {
          text: 'That could change everything.',
          nextNodeId: 'change_everything',
        },
        {
          text: "Sounds like science fiction.",
          nextNodeId: 'science_fiction',
        },
      ],
    },

    {
      id: 'change_everything',
      text: "Exactly! Imagine - a machine that could predict weather patterns, optimize crop yields, calculate the safest route through dangerous terrain. *He pauses* IVRC imagined something darker. They wanted to use such technology for... other purposes. That's part of why we parted ways.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_ivrc_hint' }],
      choices: [
        {
          text: 'What darker purposes?',
          nextNodeId: 'darker_purposes',
        },
        {
          text: "Best it stays with you then.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'science_fiction',
      text: "*He chuckles* Everything useful was science fiction once. Flight? Fiction. Instant communication across miles? Fiction. Machines that replace human labor? Once fiction, now fact. The only difference between fantasy and reality is time and effort.",
      choices: [
        {
          text: 'You make a good point.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'darker_purposes',
      text: "*He glances around nervously* I've said too much already. Let's just say IVRC has projects beyond mining and railroads. Projects that require... unconventional thinking. They brought in specialists, kept everything compartmentalized. I only saw pieces, but what I saw... *He shudders* Some knowledge should stay buried.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_knows_remnant_hint' }],
      choices: [
        {
          text: 'What did you see?',
          nextNodeId: 'what_saw',
        },
        {
          text: 'Project Remnant?',
          nextNodeId: 'remnant_question',
          conditions: [{ type: 'flag_set', target: 'heard_project_remnant' }],
        },
      ],
    },

    {
      id: 'what_saw',
      text: "*He's quiet for a long moment* Machines designed to control rather than help. Devices for surveillance, for... containment. And something else. Something in the mountains that they found. I never learned what exactly, but they were excited. Dangerously excited.",
      choices: [
        {
          text: 'In the Iron Mountains?',
          nextNodeId: 'iron_mountains',
        },
        {
          text: "That's disturbing.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'iron_mountains',
      text: "*He nods slowly* Deep in the restricted zones. They've been expanding the mining operations as cover, but the real work happens somewhere else. Somewhere even the miners don't go. *He meets your eyes* If you're thinking of investigating, be very careful. People who ask too many questions about that project... disappear.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_warned_mountains' }],
      choices: [
        {
          text: "I'll be careful. Thank you for the warning.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'remnant_question',
      text: "*He goes pale* Where did you hear that name? *He rushes to close the window* That project is... I thought it was just research at first. Advanced engineering, pushing boundaries. But then I saw the schematics. The scale of what they're building... *He takes a shaky breath* It's not mining equipment. It's not railroad infrastructure. It's something else entirely.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_confirmed_remnant' }],
      choices: [
        {
          text: 'What is it?',
          nextNodeId: 'remnant_details',
        },
        {
          text: 'Why were you involved?',
          nextNodeId: 'involvement',
        },
      ],
    },

    {
      id: 'remnant_details',
      text: "*He speaks barely above a whisper* They found something. In the mountains, deep underground. Something... old. Not natural. The project is about understanding it, harnessing it. I designed some of the containment systems before I realized what they were for. When I tried to ask questions, they tried to silence me. I ran.",
      onEnterEffects: [
        { type: 'set_flag', target: 'knows_remnant_details' },
        { type: 'change_reputation', value: 15 },
      ],
      choices: [
        {
          text: 'Something old and unnatural?',
          nextNodeId: 'unnatural_thing',
        },
        {
          text: 'Can you help me stop them?',
          nextNodeId: 'help_stop',
        },
      ],
    },

    {
      id: 'unnatural_thing',
      text: "I only saw fragments of the reports. Strange energy signatures. Geometric patterns that shouldn't exist in nature. *He wrings his hands* The scientists they brought in - not engineers, but researchers from eastern universities - they were baffled and excited in equal measure. Whatever it is, it predates human civilization.",
      choices: [
        {
          text: 'That sounds impossible.',
          nextNodeId: 'sounds_impossible',
        },
        {
          text: 'We need to expose this.',
          nextNodeId: 'help_stop',
        },
      ],
    },

    {
      id: 'sounds_impossible',
      text: "*He laughs hollowly* I'm a scientist. I believe in evidence. And the evidence suggests something is buried in those mountains that defies everything we think we know. IVRC wants to weaponize it. *He meets your eyes* That cannot be allowed to happen.",
      choices: [
        {
          text: "I'll do what I can to stop them.",
          nextNodeId: 'help_stop',
        },
      ],
    },

    {
      id: 'help_stop',
      text: "*He grips your arm* You would help? I... I've been alone in this for so long. *He releases you, composing himself* I still have some contacts inside. People who share my concerns. And I've been working on devices that might be useful - for infiltration, for gathering evidence. If you're serious about this...",
      choices: [
        {
          text: "I'm serious. What do you need?",
          nextNodeId: 'what_needed',
        },
        {
          text: 'What kind of devices?',
          nextNodeId: 'infiltration_devices',
        },
      ],
    },

    {
      id: 'what_needed',
      text: "*He begins pacing excitedly* Parts! Specific components I can't acquire without raising suspicion. There's a salvage yard outside Iron Gulch - the Pinkertons confiscate equipment from Copperhead raids. Among the wreckage, there should be precision gears, copper wiring, and a particular type of pressure valve. Bring me those, and I can complete the Infiltrator.",
      onEnterEffects: [{ type: 'start_quest', target: 'cogsworths_contraption' }],
      choices: [
        {
          text: "What's the Infiltrator?",
          nextNodeId: 'infiltrator_explanation',
        },
        {
          text: "I'll get the parts.",
          nextNodeId: 'get_parts',
        },
      ],
    },

    {
      id: 'infiltrator_explanation',
      text: "*He gestures grandly* A masterpiece of discrete engineering! A device that can disable locks, jam surveillance mechanisms, and emit a localized electrical pulse to disrupt steam-powered security systems. With it, accessing IVRC's restricted facilities becomes... possible.",
      choices: [
        {
          text: "I'll get those parts for you.",
          nextNodeId: 'get_parts',
        },
      ],
    },

    {
      id: 'get_parts',
      text: "*He claps his hands together* Excellent! The salvage yard is guarded, but lightly - they don't expect anyone to want 'junk.' Be careful nonetheless. And... *He hesitates* Thank you. You may be the first person to believe me about all this.",
      onEnterEffects: [{ type: 'set_flag', target: 'parts_quest_active' }],
      choices: [
        {
          text: "I'll return with the parts.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'infiltration_devices',
      text: "Devices for... let's say, 'unauthorized access.' Lock-breakers, signal jammers, that sort of thing. *He looks slightly embarrassed* I told myself I was building them for theoretical purposes. But really, I've been preparing. Waiting for someone willing to act.",
      choices: [
        {
          text: "I'm willing. What do you need?",
          nextNodeId: 'what_needed',
        },
        {
          text: 'I need to think about this.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'involvement',
      text: "I was young, ambitious. IVRC recruited me straight from university - brilliant salary, unlimited research budget, all the equipment I could want. *He sighs* I didn't ask enough questions at first. By the time I started asking, I'd already designed systems that were being used for... purposes I never intended.",
      choices: [
        {
          text: "You couldn't have known.",
          nextNodeId: 'couldnt_known',
        },
        {
          text: 'What did you design for them?',
          nextNodeId: 'what_designed',
        },
      ],
    },

    {
      id: 'couldnt_known',
      text: "*He shakes his head* I should have known. The secrecy, the compartmentalization, the way they deflected questions. I wanted to believe I was doing good work. *He straightens* But now I know better. And I intend to make amends.",
      choices: [
        {
          text: 'How can I help?',
          nextNodeId: 'help_stop',
        },
        {
          text: "That's admirable.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'what_designed',
      text: "Containment systems, primarily. Mechanisms to contain pressure, energy, volatile substances. At the time, I thought it was for improved mining safety. *He laughs bitterly* I was such a fool. Those systems weren't designed to contain industrial hazards. They were designed to contain... something else.",
      choices: [
        {
          text: 'The thing in the mountains.',
          nextNodeId: 'remnant_details',
        },
        {
          text: "That must weigh on you.",
          nextNodeId: 'weighs_on_me',
        },
      ],
    },

    {
      id: 'weighs_on_me',
      text: "Every day. Every invention I create now is an attempt at penance. If I can help more people than my IVRC work hurt... *He trails off* Perhaps it will never balance. But I have to try.",
      choices: [
        {
          text: "That's all any of us can do.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'others_hurt',
      text: "*His face falls* Once. A young assistant - curious boy, loved to watch me work. An experiment went wrong and... *He removes his spectacles to wipe them* He recovered, mostly. Lost hearing in one ear. I paid for his medical care, set him up with a job elsewhere. But I never forgave myself.",
      choices: [
        {
          text: "Accidents happen. You took responsibility.",
          nextNodeId: 'took_responsibility',
        },
        {
          text: "That must have been difficult.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'took_responsibility',
      text: "*He nods slowly* I did. And I learned to be more careful - not just with my experiments, but with who I allow near them. Now I work alone. Safer that way. Lonelier, but safer.",
      choices: [
        {
          text: 'The work matters.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'calm_about_explosions',
      text: "*He chuckles* When you've had as many experiments fail as I have, you develop a certain... equanimity. Besides, controlled explosions are just rapid expansion of gases. Uncontrolled explosions are the same thing, just less... planned. The physics don't judge.",
      choices: [
        {
          text: "That's a unique perspective.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'weapons_question',
      text: "*His expression grows serious* I have the knowledge to create weapons, yes. But I choose not to. The world has enough ways to kill - it doesn't need my genius adding to them. My work is meant to protect, to explore, to make life easier. Not to end it.",
      choices: [
        {
          text: 'A principled stance.',
          nextNodeId: 'principled_stance',
        },
        {
          text: "What about defensive weapons?",
          nextNodeId: 'defensive_weapons',
        },
      ],
    },

    {
      id: 'principled_stance',
      text: "Principles are all that separate an inventor from a monster. IVRC wanted me to design weapons - more efficient ways to suppress workers, to eliminate 'obstacles.' I refused. That refusal cost me my position, but kept my soul intact.",
      onEnterEffects: [{ type: 'change_reputation', value: 10 }],
      choices: [
        {
          text: 'You made the right choice.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'defensive_weapons',
      text: "*He considers* Defensive tools are a grey area. My flash-bang devices, smoke-makers - they disable without killing. The Spark Glove could be lethal if misused, but it's designed to incapacitate, not kill. I walk a fine line, but I believe protection is justified.",
      choices: [
        {
          text: 'Could I purchase some defensive items?',
          nextNodeId: 'buy_inventions',
        },
        {
          text: 'A reasonable distinction.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'use_for_device',
      text: "Imagine calculating the optimal routes for supply distribution. Predicting where diseases might spread before they do. Analyzing geological data to find resources without destructive exploration. *His eyes shine* A thinking machine could solve problems that have plagued humanity for centuries!",
      choices: [
        {
          text: 'Or it could be used for control.',
          nextNodeId: 'used_for_control',
        },
        {
          text: "That's an ambitious dream.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'used_for_control',
      text: "*His enthusiasm dims* Yes. That's exactly what IVRC wanted. Predictive models for worker behavior. Optimization of surveillance. Machine-enhanced enforcement. *He shakes his head* Tools are neutral. It's the wielder who determines their purpose. That's why I left - I couldn't let my work serve their vision.",
      choices: [
        {
          text: 'Thank you for choosing the harder path.',
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'ivrc_fired',
      text: "*He laughs without humor* Fired is a polite way of putting it. They wanted me to focus solely on extraction efficiency - faster mining, more output, regardless of worker safety. When I submitted proposals for safer equipment instead, they called me 'counterproductive.' When I persisted, they called security.",
      choices: [
        {
          text: 'They threw you out for caring about workers?',
          nextNodeId: 'caring_about_workers',
        },
        {
          text: "That's their loss.",
          nextNodeId: 'their_loss',
        },
      ],
    },

    {
      id: 'caring_about_workers',
      text: "Among other things. I also refused to work on certain... projects. They wanted weapons, surveillance systems, things designed to control rather than help. *He shudders* When I saw what they were building in the mountains, I knew I had to leave. Even if it cost me everything.",
      choices: [
        {
          text: 'What were they building?',
          nextNodeId: 'what_saw',
        },
        {
          text: 'You did the right thing.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'their_loss',
      text: "*He preens slightly* Indeed! My best work has come since leaving them. Without corporate restrictions, I can pursue ideas they'd have dismissed as 'impractical.' *He gestures around* All of this - funded by selling smaller inventions to those who appreciate them. Freedom is worth more than any salary.",
      choices: [
        {
          text: 'I would like to see some of your inventions.',
          nextNodeId: 'buy_inventions',
        },
        {
          text: 'A good philosophy.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_past',
      text: "*His expression darkens momentarily* Ah. Yes. Five years I worked for Iron Valley Rail Corporation. Brilliant facilities, unlimited resources, complete moral bankruptcy. They recruited me for my mind, then tried to cage it. When I refused to comply, we... parted ways. Violently.",
      choices: [
        {
          text: 'Violently?',
          nextNodeId: 'violent_departure',
        },
        {
          text: 'What were they trying to make you do?',
          nextNodeId: 'ivrc_fired',
        },
        {
          text: "Sounds like you're better off.",
          nextNodeId: 'their_loss',
        },
      ],
    },

    {
      id: 'violent_departure',
      text: "*He touches a faded scar on his temple* They sent men to 'escort' me from the premises. When I resisted - I had research notes I refused to surrender - things escalated. I escaped with my life, a few prototypes, and burns from a chemistry lab fire. *He smiles thinly* They reported me dead. I found that convenient.",
      onEnterEffects: [{ type: 'set_flag', target: 'knows_cogsworth_escape' }],
      choices: [
        {
          text: 'IVRC thinks you are dead?',
          nextNodeId: 'ivrc_thinks_dead',
        },
        {
          text: "That's terrifying.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_thinks_dead',
      text: "Officially, Professor Emmett Cogsworth died in a laboratory accident caused by his own negligence. Unofficially... *He grins* I suspect some people know better. But I've stayed out here, away from their main operations, causing no trouble. They have no reason to correct the record.",
      choices: [
        {
          text: "Until now, perhaps.",
          nextNodeId: 'until_now',
        },
        {
          text: "A useful cover story.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'until_now',
      text: "*He meets your eyes* You're perceptive. Yes, if I help expose what they're doing in the mountains, my 'death' becomes inconvenient for them. *He takes a deep breath* But some things are worth the risk. I've been hiding for five years. Perhaps it's time to stop.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_willing_to_act' }],
      choices: [
        {
          text: "I'll help protect you.",
          nextNodeId: 'protect_promise',
        },
        {
          text: 'Are you sure you want this?',
          nextNodeId: 'sure_want_this',
        },
      ],
    },

    {
      id: 'protect_promise',
      text: "*He looks genuinely touched* You would do that? I... thank you. I've been alone in this for so long. *He straightens* Very well. If we're going to expose IVRC, we'll need evidence and allies. I can provide the former. The latter... that's where you come in.",
      onEnterEffects: [{ type: 'change_reputation', value: 15 }],
      choices: [
        {
          text: 'What allies do you have in mind?',
          nextNodeId: 'potential_allies',
        },
        {
          text: "I'll find what help I can.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'potential_allies',
      text: "The Freeminers in the mountains - they hate IVRC and know the terrain. The bounty hunter, Black Belle - she has her own grudge against the corporation. And there's a doctor in Dusty Springs, Chen Wei, who runs an underground network. If we could unite these forces...",
      choices: [
        {
          text: 'I know some of them already.',
          nextNodeId: 'know_them',
        },
        {
          text: "I'll start making connections.",
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'building_coalition' }],
        },
      ],
    },

    {
      id: 'know_them',
      text: "*His eyes widen* You do? Excellent! Then we're not starting from nothing. *He begins pacing excitedly* I can provide gadgets, technical knowledge, information about IVRC's weaknesses. Combined with their resources... we might actually stand a chance.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_coalition_member' }],
      choices: [
        {
          text: "Let's make this happen.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'sure_want_this',
      text: "*He's quiet for a moment* Want? No. I want to tinker in peace, to create without fear. But I've seen what IVRC is capable of. If no one stops them... *He looks at his hands* My inventions are meant to help people. What's the point if I let evil flourish through inaction?",
      choices: [
        {
          text: "You're braver than you give yourself credit for.",
          nextNodeId: 'protect_promise',
        },
        {
          text: "Think carefully before committing.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'impressed',
      text: "*He beams at the compliment* Thank you! It's a humble workshop, but it's mine. No corporate oversight, no profit margins, no ethical compromises. Just pure innovation. *He gestures proudly* Would you like to see what I'm working on?",
      choices: [
        {
          text: 'Yes, show me.',
          nextNodeId: 'current_projects',
        },
        {
          text: 'Maybe another time.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'current_projects',
      text: "*He leads you to a workbench* Current projects! This is a portable telegraph - communicates without wires using electrical resonance. Still working out the range issues. This is a water purifier - makes any water drinkable. And this... *He unveils a complex apparatus* ...is my prototype Analytical Engine component.",
      onEnterEffects: [{ type: 'set_flag', target: 'saw_cogsworth_projects' }],
      choices: [
        {
          text: 'A wireless telegraph? Impossible.',
          nextNodeId: 'wireless_telegraph',
        },
        {
          text: 'The Analytical Engine - tell me more.',
          nextNodeId: 'thinking_machine',
        },
        {
          text: 'The water purifier could save lives.',
          nextNodeId: 'water_purifier',
        },
      ],
    },

    {
      id: 'wireless_telegraph',
      text: "*He grins* That's what IVRC said! But the principles are sound - electrical signals propagate through the air just as they do through wire, given sufficient power. The challenge is reception and range. *He tinkers with a dial* I can currently achieve about half a mile. Not practical yet, but I'm making progress!",
      choices: [
        {
          text: 'That would revolutionize communication.',
          nextNodeId: 'revolutionize_communication',
        },
        {
          text: 'Interesting. What else are you working on?',
          nextNodeId: 'current_projects',
        },
      ],
    },

    {
      id: 'revolutionize_communication',
      text: "Exactly! Imagine scouts able to report instantly from miles away. Rescue parties coordinating in real-time. Communities warning each other of dangers without waiting for a rider. *He sighs* IVRC wanted it for military applications, of course. I want it to save lives.",
      choices: [
        {
          text: 'When you perfect it, let me know.',
          nextNodeId: null,
          effects: [{ type: 'set_flag', target: 'interested_in_wireless' }],
        },
      ],
    },

    {
      id: 'water_purifier',
      text: "Yes! Clean water is the foundation of civilization. This device uses heat and filtration to remove impurities - bacteria, parasites, toxins. *He demonstrates* A traveler with this could drink from any stream safely. Miners could have clean water in their camps. Cholera and dysentery could be things of the past!",
      choices: [
        {
          text: 'How much does it cost?',
          nextNodeId: 'purifier_cost',
        },
        {
          text: 'You should mass produce these.',
          nextNodeId: 'mass_produce',
        },
      ],
    },

    {
      id: 'purifier_cost',
      text: "Twenty gold for the portable version. It's not cheap to make - the filter components require specific materials. But compared to the cost of illness... *He shrugs* I think it's worth it. I've already sold several to miners heading into remote areas.",
      choices: [
        {
          text: '[Pay 20 gold] I will take one.',
          nextNodeId: 'buy_purifier',
          effects: [{ type: 'take_gold', value: 20 }],
          conditions: [{ type: 'gold_gte', value: 20 }],
        },
        {
          text: 'Maybe later.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'buy_purifier',
      text: "*He carefully packages a brass device with tubes and a hand pump* Here you are! Fill the chamber with any water source, pump three times, wait one minute. The output is perfectly safe to drink. *He hands it over* Stay hydrated, friend!",
      onEnterEffects: [{ type: 'give_item', target: 'water_purifier' }],
      choices: [
        {
          text: 'Thank you, Professor.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'mass_produce',
      text: "*He sighs* I wish I could. But mass production requires facilities, workers, capital - things I don't have. IVRC could mass produce these, but they won't. Clean water for workers costs money without generating profit. *He shakes his head* That's the tragedy of corporate innovation.",
      choices: [
        {
          text: "Maybe that will change someday.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'need_gadgets',
      text: "*He perks up* Gadgets! Wonderful! I have all sorts of useful devices. What are you looking for? Exploration equipment? Defensive tools? Utility items? Or perhaps something more... specialized?",
      choices: [
        {
          text: 'Something for exploration.',
          nextNodeId: 'exploration_items',
        },
        {
          text: 'Self-defense equipment.',
          nextNodeId: 'defense_items',
        },
        {
          text: 'Something specialized.',
          nextNodeId: 'specialized_items',
        },
        {
          text: 'Just browsing for now.',
          nextNodeId: 'buy_inventions',
        },
      ],
    },

    {
      id: 'specialized_items',
      text: "*He glances around conspiratorially* Specialized, you say? I have... certain items that aren't strictly legal. Lock-breakers, signal scramblers, devices for avoiding detection. *He meets your eyes* I only sell these to people I trust. Are you trustworthy?",
      choices: [
        {
          text: "I won't misuse them.",
          nextNodeId: 'trust_assessment',
        },
        {
          text: 'Maybe I should stick to normal items.',
          nextNodeId: 'buy_inventions',
        },
      ],
    },

    {
      id: 'trust_assessment',
      text: "*He studies you carefully* Very well. But know that these devices can be traced back to me. If they're used to harm innocents, I will personally ensure the consequences find you. *He smiles* With that understanding, shall I show you what I have?",
      choices: [
        {
          text: 'I understand. Show me.',
          nextNodeId: 'specialized_shop',
        },
        {
          text: "On second thought, never mind.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'specialized_shop',
      text: "*He unlocks a hidden cabinet* Here we are. Lock-breaker - opens most mechanical locks. Signal jammer - disrupts telegraph communications in a small radius. And my prototype Infiltrator kit - still incomplete, but useful for... discreet operations.",
      onEnterEffects: [{ type: 'set_flag', target: 'cogsworth_trusts_player' }],
      choices: [
        {
          text: '[Browse Specialized Shop]',
          nextNodeId: null,
          effects: [{ type: 'open_shop', target: 'cogsworth_special_gadgets' }],
          tags: ['shop'],
        },
        {
          text: 'The Infiltrator kit - what does it need to be complete?',
          nextNodeId: 'what_needed',
        },
      ],
    },

    {
      id: 'research_interest',
      text: "*His eyes light up* A fellow inquiring mind! What aspect interests you? The practical applications of steam power? The theoretical foundations of electrical phenomena? Or perhaps... *He lowers his voice* ...my work on the forbidden projects?",
      choices: [
        {
          text: 'Forbidden projects?',
          nextNodeId: 'darker_purposes',
        },
        {
          text: 'The practical applications sound useful.',
          nextNodeId: 'practical_applications',
        },
        {
          text: 'Electrical phenomena.',
          nextNodeId: 'electrical_phenomena',
        },
      ],
    },

    {
      id: 'practical_applications',
      text: "*He launches into an enthusiastic lecture* Steam power is just the beginning! With proper pressure systems, we can amplify human strength a hundredfold. My digging machine - when perfected - could tunnel through solid rock faster than a team of miners. Agricultural equipment could harvest in hours what takes days. The possibilities are endless!",
      choices: [
        {
          text: 'Why hasn\'t this spread everywhere?',
          nextNodeId: 'why_not_spread',
        },
        {
          text: 'Fascinating. Please, continue.',
          nextNodeId: 'continue_lecture',
        },
      ],
    },

    {
      id: 'why_not_spread',
      text: "Cost. Control. Fear. *He counts on his fingers* Corporations like IVRC don't want efficient machines owned by individuals - they want workers dependent on company equipment. If every farmer could harvest their own fields with a steam-powered device, what would become of the labor market?",
      choices: [
        {
          text: 'They suppress innovation for profit.',
          nextNodeId: 'suppress_innovation',
        },
        {
          text: 'A cynical view.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'suppress_innovation',
      text: "Precisely! I've seen it firsthand. Patents bought and buried. Inventors paid to stay quiet. Or worse - accidents that aren't really accidents. *He shakes his head* Progress threatens those in power. That's why I work alone, sell quietly, and hope for a better future.",
      choices: [
        {
          text: "Maybe that future is coming.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
      ],
    },

    {
      id: 'continue_lecture',
      text: "*He talks for several minutes about pressure differentials, gear ratios, and thermodynamic principles, growing increasingly animated* ...and that's why the fourth prototype exploded! But the fifth - the fifth has promise. *He notices your expression* Ah. I've been lecturing again, haven't I?",
      choices: [
        {
          text: "It's fascinating, really.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 5 }],
        },
        {
          text: 'Perhaps we could discuss something else.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'electrical_phenomena',
      text: "*He grows animated* Electricity! The future of everything! Lightning in a bottle, controllable and directed. I've been experimenting with storage cells - devices that can hold electrical charge for later use. Imagine - portable power, available anywhere!",
      choices: [
        {
          text: 'How would that work?',
          nextNodeId: 'how_electrical_works',
        },
        {
          text: 'Sounds dangerous.',
          nextNodeId: 'electrical_dangerous',
        },
      ],
    },

    {
      id: 'how_electrical_works',
      text: "Chemical reactions! Certain metals and acids, properly arranged, generate electrical flow. My cells use zinc and copper in a sulfuric solution. *He shows you a brass cylinder* This prototype can power a small lamp for several hours. Scaling up is the challenge.",
      choices: [
        {
          text: 'This could change everything.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'electrical_dangerous',
      text: "Dangerous? *He laughs* Everything useful is dangerous! Fire, steam, chemicals - all dangerous, all essential to progress. The trick is understanding the danger and respecting it. Electricity is no different. Properly controlled, it's a tool. Improperly handled... *He shows a burn scar* ...well.",
      choices: [
        {
          text: 'Point taken.',
          nextNodeId: null,
        },
      ],
    },

    // Return greetings and quest states
    {
      id: 'return_greeting',
      text: "*Cogsworth looks up from his workbench, spectacles askew* Ah, you've returned! Excellent, excellent. Come in, come in - mind the equipment. What brings you back to my humble laboratory?",
      expression: 'pleased',
      choices: [
        {
          text: 'Just checking in on your work.',
          nextNodeId: 'work_update',
        },
        {
          text: "I'd like to buy some equipment.",
          nextNodeId: 'buy_inventions',
        },
        {
          text: 'Any news about IVRC?',
          nextNodeId: 'ivrc_news',
          conditions: [{ type: 'flag_set', target: 'cogsworth_knows_remnant_hint' }],
        },
        {
          text: 'Just passing through.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'work_update',
      text: "*He beams* Progress! Slow but steady. The digging machine is almost stable - only minor explosions now. And I've improved the cavity detector's range by fifteen percent. *He gestures around* Every day, a little closer to the future I envision.",
      choices: [
        {
          text: 'Good to hear.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'ivrc_news',
      text: "*His expression becomes serious* I've heard rumors. More activity in the mountains. Scientists arriving by coach, heavily guarded. Whatever Project Remnant is, they're accelerating it. *He meets your eyes* We may not have as much time as I thought.",
      choices: [
        {
          text: "Then we need to act soon.",
          nextNodeId: 'act_soon',
        },
        {
          text: "I'll keep gathering information.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'act_soon',
      text: "Agreed. Have you made progress gathering allies? *He wrings his hands* I've been preparing what I can - devices, documents, maps of the facility from my time there. When you're ready to move, I'll provide everything I have.",
      choices: [
        {
          text: "I'm building a coalition.",
          nextNodeId: 'coalition_progress',
        },
        {
          text: "Still working on it.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'coalition_progress',
      text: "*His eyes widen with hope* Really? Who have you brought on board? The Freeminers? That bounty hunter? *He clasps his hands* If we have enough people, we might actually be able to do this. Expose IVRC, shut down Remnant, maybe even... maybe even win.",
      choices: [
        {
          text: "We'll win. I promise you that.",
          nextNodeId: null,
          effects: [{ type: 'change_reputation', value: 10 }],
        },
      ],
    },

    {
      id: 'has_parts_greeting',
      text: "*Cogsworth's eyes light up as he sees you* You have them! The parts I needed! *He rushes over eagerly* Please, please - let me see! With these components, the Infiltrator will finally be complete!",
      expression: 'excited',
      choices: [
        {
          text: '[Give parts] Here they are.',
          nextNodeId: 'parts_delivered',
          effects: [{ type: 'take_item', target: 'rare_parts' }],
        },
        {
          text: 'Actually, I need these for something else.',
          nextNodeId: 'keep_parts',
        },
      ],
    },

    {
      id: 'parts_delivered',
      text: "*He accepts the components reverently* Precision gears... copper wiring... the pressure valve! Perfect condition! *He immediately begins fitting them into a complex device* Give me a few hours and the Infiltrator will be ready. You've done good work, friend.",
      onEnterEffects: [
        { type: 'complete_quest', target: 'cogsworths_contraption' },
        { type: 'give_gold', value: 50 },
        { type: 'change_reputation', value: 20 },
      ],
      choices: [
        {
          text: "I'll return for the device.",
          nextNodeId: 'return_for_device',
        },
      ],
    },

    {
      id: 'return_for_device',
      text: "Yes, yes - come back tomorrow. The Infiltrator will be calibrated and ready. *He's already deeply absorbed in assembly* This device will be the key to exposing Remnant. We're one step closer to justice!",
      onEnterEffects: [{ type: 'set_flag', target: 'infiltrator_building' }],
      choices: [
        {
          text: 'Until tomorrow, Professor.',
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'keep_parts',
      text: "*His face falls* Oh. I see. Well... if you truly need them... *He tries to hide his disappointment* I suppose I can wait longer for the Infiltrator. The work isn't going anywhere.",
      choices: [
        {
          text: "I'm sorry. I'll try to find more.",
          nextNodeId: null,
        },
        {
          text: 'Actually, take them. This is more important.',
          nextNodeId: 'parts_delivered',
          effects: [{ type: 'take_item', target: 'rare_parts' }],
        },
      ],
    },

    {
      id: 'quest_active_greeting',
      text: "*Cogsworth looks up hopefully* Any luck finding the parts? The salvage yard outside Iron Gulch - precision gears, copper wiring, a pressure valve. With those components, I can complete the Infiltrator!",
      expression: 'hopeful',
      choices: [
        {
          text: 'Still looking. Any tips?',
          nextNodeId: 'parts_tips',
        },
        {
          text: "Working on it. I'll be back soon.",
          nextNodeId: null,
        },
      ],
    },

    {
      id: 'parts_tips',
      text: "The salvage yard is guarded, but the guards change shifts at dawn and dusk - about ten minutes of reduced coverage each time. The parts I need would be in the 'high value' section - usually the most intact equipment from confiscated shipments. Be careful, and be quick.",
      choices: [
        {
          text: "I'll find them.",
          nextNodeId: null,
        },
      ],
    },
  ],
};

export const ProfessorCogsworthDialogues = [ProfessorCogsworthMainDialogue];
