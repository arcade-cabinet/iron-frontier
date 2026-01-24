// DialogueBox - FF7-style typewriter dialogue
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { type Quest } from '../../engine/types';
import { useGameStore } from '../store/gameStore';

export function DialogueBox() {
  const {
    phase,
    dialogueState,
    npcs,
    setDialogue,
    acceptQuest,
    activeQuests,
    settings
  } = useGameStore();

  const dialogueOpen = phase === 'dialogue' && !!dialogueState;
  const selectedNPC = dialogueState ? npcs[dialogueState.npcId] : null;

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuestPrompt, setShowQuestPrompt] = useState(false);

  // Initialize typewriter when dialogue opens
  useEffect(() => {
    if (!dialogueOpen || !dialogueState) {
      setDisplayText('');
      setShowQuestPrompt(false);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
  }, [dialogueOpen, dialogueState]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || !dialogueState?.text) return;

    let index = 0;
    const speed = settings.reducedMotion ? 5 : 30;
    const fullText = dialogueState.text;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);

        // Show quest prompt after typing completes if NPC is a quest giver and no active quest exists
        if (selectedNPC?.questGiver && !activeQuests.find(q => q.giverNpcId === selectedNPC.id)) {
          setTimeout(() => setShowQuestPrompt(true), 300);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isTyping, dialogueState, settings.reducedMotion, selectedNPC, activeQuests]);

  // Handle tap
  const handleTap = useCallback(() => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }

    const fullText = dialogueState?.text || '';

    if (isTyping) {
      // Skip to end
      setDisplayText(fullText);
      setIsTyping(false);

      if (selectedNPC?.questGiver && !activeQuests.find(q => q.giverNpcId === selectedNPC.id)) {
        setTimeout(() => setShowQuestPrompt(true), 100);
      }
    } else if (showQuestPrompt) {
      // Accept quest
      if (selectedNPC) {
        const quest: Quest = {
          id: `quest_${selectedNPC.id}_${Date.now()}`,
          title: `${selectedNPC.name}'s Request`,
          description: `Help ${selectedNPC.name} with an important task.`,
          giverNpcId: selectedNPC.id,
          status: 'active',
          objectives: [
            { id: 'objective1', description: 'Investigate the matter', type: 'go_to', targetPosition: selectedNPC.position, required: 1, current: 0, completed: false },
            { id: 'objective2', description: `Return to ${selectedNPC.name}`, type: 'talk', targetId: selectedNPC.id, required: 1, current: 0, completed: false },
          ],
          rewards: { xp: 100, gold: 50 },
        };
        acceptQuest(quest);
      }
      setDialogue(null);
    } else {
      setDialogue(null);
    }
  }, [isTyping, dialogueState, showQuestPrompt, selectedNPC, setDialogue, acceptQuest, activeQuests, settings.haptics]);

  if (!dialogueOpen || !selectedNPC) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute inset-x-3 bottom-24 z-50"
        onClick={handleTap}
      >
        <Card className="bg-amber-950/95 border-2 border-amber-600 shadow-lg backdrop-blur-sm">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-amber-400 text-base flex items-center justify-between">
              <span>{selectedNPC.name}</span>
              <div className="flex gap-2">
                {selectedNPC.questGiver && !activeQuests.find(q => q.giverNpcId === selectedNPC.id) && (
                  <Badge className="bg-yellow-600 text-yellow-100 text-xs">Quest</Badge>
                )}
                <Badge variant="outline" className="text-amber-500 border-amber-600 text-xs">
                  {selectedNPC.role}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <p className="text-amber-100 text-sm whitespace-pre-line min-h-[80px] leading-relaxed">
              {displayText}
              {isTyping && <span className="animate-pulse text-amber-400">|</span>}
            </p>

            {showQuestPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600/50 rounded-lg"
              >
                <p className="text-yellow-200 text-sm">
                  {selectedNPC.name} has a task for you. Accept quest?
                </p>
              </motion.div>
            )}

            <div className="text-amber-500 text-xs mt-3 text-right">
              {isTyping ? 'Tap to skip' : showQuestPrompt ? 'Tap to accept' : 'Tap to close'}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
