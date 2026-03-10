import * as React from "react";
import { gameAudioBridge } from "@/src/game/services/audio/GameAudioBridge";
import type { GameSettings } from "@/src/game/store/types";

export function useTypewriter(text: string, nodeId: string, settings: GameSettings | null) {
  const [displayText, setDisplayText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showChoices, setShowChoices] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const prevNodeIdRef = React.useRef<string | null>(null);
  const charCountRef = React.useRef(0);

  const clearTimers = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  React.useEffect(() => {
    if (prevNodeIdRef.current === nodeId) return;
    prevNodeIdRef.current = nodeId;

    clearTimers();
    setDisplayText("");
    setIsTyping(true);
    setShowChoices(false);
    charCountRef.current = 0;

    const speed = settings?.reducedMotion ? 5 : 25;
    let index = 0;

    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        index += 1;
        charCountRef.current = index;
        setDisplayText(text.slice(0, index));

        if (!settings?.reducedMotion && index % 3 === 0 && text[index - 1] !== " ") {
          gameAudioBridge.playSFX("dialogue_advance");
        }
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
        timeoutRef.current = setTimeout(() => {
          setShowChoices(true);
        }, 200);
      }
    }, speed);

    return clearTimers;
  }, [text, nodeId, settings?.reducedMotion, clearTimers]);

  React.useEffect(() => clearTimers, [clearTimers]);

  const skipTyping = React.useCallback(() => {
    if (!isTyping) return;
    clearTimers();
    setDisplayText(text);
    setIsTyping(false);
    timeoutRef.current = setTimeout(() => {
      setShowChoices(true);
    }, 100);
  }, [isTyping, text, clearTimers]);

  const reset = React.useCallback(() => {
    clearTimers();
    setDisplayText("");
    setIsTyping(false);
    setShowChoices(false);
    prevNodeIdRef.current = null;
    charCountRef.current = 0;
  }, [clearTimers]);

  return { displayText, isTyping, showChoices, skipTyping, reset };
}
