// DialogueBox - Enhanced FF7-style branching dialogue

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, MessageSquare, User } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '../store/webGameStore';

/**
 * Expression to color mapping for NPC portrait accents
 */
const EXPRESSION_COLORS: Record<string, string> = {
  angry: 'border-red-500',
  happy: 'border-green-500',
  sad: 'border-blue-500',
  suspicious: 'border-yellow-500',
  worried: 'border-orange-500',
  threatening: 'border-red-600',
  curious: 'border-cyan-500',
  friendly: 'border-emerald-500',
  serious: 'border-slate-500',
  thoughtful: 'border-purple-500',
  shocked: 'border-pink-500',
  determined: 'border-amber-500',
  eager: 'border-lime-500',
  bitter: 'border-rose-500',
};

/**
 * Get border color class based on NPC expression
 */
function getExpressionBorder(expression?: string): string {
  if (!expression) return 'border-amber-600';
  return EXPRESSION_COLORS[expression] || 'border-amber-600';
}

export function DialogueBox() {
  const {
    phase,
    dialogueState,
    selectChoice,
    advanceDialogue,
    endDialogue,
    settings,
    getActiveNPC,
  } = useGameStore();

  const dialogueOpen = phase === 'dialogue' && !!dialogueState;
  const activeNPC = useMemo(() => getActiveNPC(), [getActiveNPC]);

  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);

  // Reset state when dialogue changes
  useEffect(() => {
    if (!dialogueOpen || !dialogueState) {
      setDisplayText('');
      setShowChoices(false);
      setSelectedChoiceIndex(null);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    setShowChoices(false);
    setSelectedChoiceIndex(null);
  }, [dialogueOpen, dialogueState?.currentNodeId, dialogueState]);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping || !dialogueState?.text) return;

    let index = 0;
    const speed = settings.reducedMotion ? 5 : 25;
    const fullText = dialogueState.text;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);

        // Show choices after typing completes
        setTimeout(() => setShowChoices(true), 200);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isTyping, dialogueState?.text, settings.reducedMotion]);

  // Skip typewriter on tap
  const handleSkipTyping = useCallback(() => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }

    if (isTyping && dialogueState?.text) {
      setDisplayText(dialogueState.text);
      setIsTyping(false);
      setTimeout(() => setShowChoices(true), 100);
    }
  }, [isTyping, dialogueState?.text, settings.haptics]);

  // Handle choice selection
  const handleChoiceSelect = useCallback(
    (index: number) => {
      if (settings.haptics && navigator.vibrate) {
        navigator.vibrate(30);
      }

      setSelectedChoiceIndex(index);
      setShowChoices(false);

      // Small delay for visual feedback
      setTimeout(() => {
        selectChoice(index);
      }, 150);
    },
    [selectChoice, settings.haptics]
  );

  // Handle auto-advance (monologues)
  const handleAdvance = useCallback(() => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }

    if (dialogueState?.autoAdvanceNodeId) {
      advanceDialogue();
    } else {
      endDialogue();
    }
  }, [dialogueState?.autoAdvanceNodeId, advanceDialogue, endDialogue, settings.haptics]);

  // Handle closing dialogue
  const handleClose = useCallback(() => {
    if (settings.haptics && navigator.vibrate) {
      navigator.vibrate(20);
    }
    endDialogue();
  }, [endDialogue, settings.haptics]);

  if (!dialogueOpen || !dialogueState) return null;

  const hasChoices = dialogueState.choices.length > 0;
  const hasAutoAdvance = !!dialogueState.autoAdvanceNodeId;
  const expressionBorder = getExpressionBorder(dialogueState.npcExpression);

  // Determine what to show at the bottom
  const showContinuePrompt = !isTyping && showChoices && !hasChoices && hasAutoAdvance;
  const showClosePrompt = !isTyping && showChoices && !hasChoices && !hasAutoAdvance;
  const showChoiceButtons = !isTyping && showChoices && hasChoices;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute inset-x-2 bottom-16 sm:inset-x-3 sm:bottom-20 z-50"
      >
        <Card className={`bg-amber-950/95 border-2 ${expressionBorder} shadow-lg backdrop-blur-sm`}>
          <CardHeader className="p-2 sm:p-3 pb-1">
            <CardTitle className="text-amber-400 text-sm sm:text-base flex items-center justify-between gap-2">
              {/* NPC Name and Portrait */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                {/* Portrait placeholder */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-900/50 border-2 ${expressionBorder} flex items-center justify-center overflow-hidden flex-shrink-0`}
                >
                  {dialogueState.npcPortraitId ? (
                    // Future: actual portrait image
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" aria-hidden="true" />
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold truncate">
                    {dialogueState.npcTitle && (
                      <span className="text-amber-500 text-xs sm:text-sm mr-1">
                        {dialogueState.npcTitle}
                      </span>
                    )}
                    {dialogueState.npcName}
                  </span>
                  {dialogueState.speaker && dialogueState.speaker !== dialogueState.npcName && (
                    <span className="text-amber-500 text-[10px] sm:text-xs truncate">
                      Speaking: {dialogueState.speaker}
                    </span>
                  )}
                </div>
              </div>

              {/* Expression/Status badges - hidden on xs for space */}
              <div className="hidden sm:flex gap-2 flex-shrink-0">
                {dialogueState.npcExpression && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${expressionBorder.replace('border-', 'text-').replace('-500', '-400').replace('-600', '-400')}`}
                  >
                    {dialogueState.npcExpression}
                  </Badge>
                )}
                {activeNPC?.questGiver && (
                  <Badge className="bg-yellow-600 text-yellow-100 text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" aria-hidden="true" />
                    Quest
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-2 sm:p-3 pt-1 sm:pt-2">
            {/* Dialogue Text Area */}
            <div
              className="text-amber-100 text-xs sm:text-sm whitespace-pre-line min-h-[50px] sm:min-h-[60px] leading-relaxed cursor-pointer"
              onClick={isTyping ? handleSkipTyping : undefined}
            >
              {displayText}
              {isTyping && <span className="animate-pulse text-amber-400 ml-0.5">|</span>}
            </div>

            {/* Choice Buttons */}
            {showChoiceButtons && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2"
              >
                {dialogueState.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleChoiceSelect(index)}
                    disabled={selectedChoiceIndex !== null}
                    className={`w-full text-left p-2 sm:p-2.5 rounded-lg border transition-all min-h-[44px] ${
                      selectedChoiceIndex === index
                        ? 'bg-amber-700/50 border-amber-500 text-amber-100'
                        : 'bg-amber-900/30 border-amber-700/50 text-amber-200 hover:bg-amber-800/40 hover:border-amber-600'
                    } ${selectedChoiceIndex !== null && selectedChoiceIndex !== index ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          selectedChoiceIndex === index ? 'text-amber-400' : 'text-amber-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs sm:text-sm">{choice.text}</span>
                    </div>
                    {choice.hint && (
                      <p className="text-amber-500 text-[10px] sm:text-xs mt-1 ml-6">
                        {choice.hint}
                      </p>
                    )}
                    {/* Show tags as subtle indicators */}
                    {choice.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 ml-6">
                        {choice.tags.includes('aggressive') && (
                          <span className="text-red-400 text-[10px] sm:text-xs">[Aggressive]</span>
                        )}
                        {choice.tags.includes('kind') && (
                          <span className="text-green-400 text-[10px] sm:text-xs">[Kind]</span>
                        )}
                        {choice.tags.includes('main_quest') && (
                          <span className="text-yellow-400 text-[10px] sm:text-xs">
                            [Main Quest]
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Continue prompt (for monologues) */}
            {showContinuePrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 sm:mt-3"
              >
                <Button
                  onClick={handleAdvance}
                  className="w-full min-h-[44px] bg-amber-700/50 hover:bg-amber-600/50 text-amber-100 border border-amber-600"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Button>
              </motion.div>
            )}

            {/* Close prompt (end of conversation) */}
            {showClosePrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 sm:mt-3"
              >
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="w-full min-h-[44px] border-amber-600 text-amber-400 hover:bg-amber-900/30"
                >
                  End Conversation
                </Button>
              </motion.div>
            )}

            {/* Typing indicator / instruction */}
            <div className="text-amber-500 text-[10px] sm:text-xs mt-1.5 sm:mt-2 text-right">
              {isTyping && 'Tap to skip...'}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
