"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { getMessages, submitMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Message {
  nama: string;
  pesan: string;
  mood?: string;
}

const MOODS = ['💪', '😊', '😴', '🤔', '🙏', '✨'];

function MsgCard({ msg, className }: { msg: Message; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 ${className ?? ''}`}>
      <div className="flex items-start gap-2.5">
        {msg.mood && (
          <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{msg.mood}</span>
        )}
        <div className="min-w-0">
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
            &ldquo;{msg.pesan}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium truncate">— {msg.nama}</p>
        </div>
      </div>
    </div>
  );
}

export default function MessageTicker() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [paused, setPaused] = useState(false);
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [mood, setMood] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const loadMessages = useCallback(async () => {
    const data = await getMessages();
    setMessages(data);
  }, []);

  useEffect(() => {
    loadMessages();
    const refresh = setInterval(loadMessages, 30000);
    window.addEventListener('message-sent', loadMessages);
    return () => {
      clearInterval(refresh);
      window.removeEventListener('message-sent', loadMessages);
    };
  }, [loadMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !pesan.trim()) return;
    setIsSubmitting(true);
    const result = await submitMessage(nama.trim(), pesan.trim(), mood || undefined);
    if (result.success) {
      setNama("");
      setPesan("");
      setMood("");
      await loadMessages();
      window.dispatchEvent(new CustomEvent('message-sent'));
      toast({ title: "Terkirim!", description: "Kata-kata semangatmu sudah terkirim." });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: result.message });
    }
    setIsSubmitting(false);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setPaused(true), 400);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (paused) setTimeout(() => setPaused(false), 1000);
  };

  // For marquee: base must cover viewport width (~1200px), card ~280px
  const buildTrack = () => {
    const minCards = Math.max(messages.length, Math.ceil(1200 / 280));
    const times = Math.ceil(minCards / messages.length);
    const base = Array.from({ length: times }, () => messages).flat();
    return [...base, ...base];
  };

  const useMarquee = messages.length >= 3;
  const track = useMarquee ? buildTrack() : [];
  const animDuration = Math.max((track.length / 2) * 4, 18);

  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center">
          <p className="text-sm text-slate-400 italic">
            Belum ada pesan hari ini. Yuk bagikan semangatmu!
          </p>
        </div>
      );
    }

    if (!useMarquee) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3 flex-wrap justify-center">
            {messages.map((msg, i) => (
              <MsgCard key={i} msg={msg} className="flex-1 min-w-[180px]" />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white py-5 cursor-default select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
            style={{ background: "linear-gradient(to right, white, transparent)" }} />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
            style={{ background: "linear-gradient(to left, white, transparent)" }} />
          <div
            className="flex gap-3 px-3 w-max"
            style={{
              animation: `marquee ${animDuration}s linear infinite`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {track.map((msg, i) => (
              <MsgCard key={i} msg={msg} className="flex-shrink-0 w-56 sm:w-64" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-2">
      {renderMessages()}

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Nama kamu"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="sm:w-36 shrink-0"
            maxLength={50}
          />
          <div className="flex-1 relative">
            <Textarea
              placeholder="Tulis kata-kata semangatmu..."
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              className="resize-none pr-14 min-h-[40px] h-10"
              maxLength={200}
              rows={1}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
              {pesan.length}/200
            </span>
          </div>
          <Button type="submit" disabled={isSubmitting} size="sm" className="shrink-0 self-end h-10">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-1.5 pl-0.5">
          <span className="text-xs text-slate-400">Mood:</span>
          {MOODS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setMood(mood === emoji ? '' : emoji)}
              className={`text-lg p-1 rounded-lg transition-all ${
                mood === emoji
                  ? 'bg-primary/10 ring-2 ring-primary/30 scale-110'
                  : 'opacity-50 hover:opacity-100 hover:bg-muted'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
