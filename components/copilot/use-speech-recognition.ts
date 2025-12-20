'use client';

import { useEffect, useRef, useState } from 'react';

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  // @ts-expect-error vendor prefix
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return (Ctor as SpeechRecognitionCtor | undefined) ?? null;
}

export function useSpeechRecognition(opts?: { lang?: string }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const Ctor = getSpeechRecognitionCtor();
    setSupported(Boolean(Ctor));
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = opts?.lang ?? 'fr-FR';
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (event) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript ?? '';
        if (res.isFinal) finalChunk += txt;
        else interim += txt;
      }

      if (finalChunk) {
        setFinalText((prev) => (prev ? `${prev}\n${finalChunk.trim()}` : finalChunk.trim()));
      }
      setInterimText(interim.trim());
    };

    rec.onerror = () => {
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      setInterimText('');
    };

    recRef.current = rec;

    return () => {
      rec.stop();
      recRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    if (!recRef.current) return;
    setInterimText('');
    setListening(true);
    recRef.current.start();
  };

  const stop = () => {
    if (!recRef.current) return;
    recRef.current.stop();
    setListening(false);
  };

  const reset = () => {
    setFinalText('');
    setInterimText('');
  };

  return {
    supported,
    listening,
    finalText,
    interimText,
    start,
    stop,
    reset,
  };
}


