"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Send } from "lucide-react";
import { getMessages, submitMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Message {
  nama: string;
  pesan: string;
}

export default function MessageTicker() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animState, setAnimState] = useState<"visible" | "exit" | "enter">("visible");
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const loadMessages = useCallback(async () => {
    const data = await getMessages();
    setMessages(data);
  }, []);

  useEffect(() => {
    loadMessages();
    const refresh = setInterval(loadMessages, 30000);
    return () => clearInterval(refresh);
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const cycle = setInterval(() => {
      setAnimState("exit");
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setAnimState("enter");
        setTimeout(() => setAnimState("visible"), 50);
      }, 350);
    }, 5000);
    return () => clearInterval(cycle);
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !pesan.trim()) return;
    setIsSubmitting(true);
    const result = await submitMessage(nama.trim(), pesan.trim());
    if (result.success) {
      setNama("");
      setPesan("");
      await loadMessages();
      toast({ title: "Terkirim!", description: "Kata-kata semangatmu sudah terkirim." });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: result.message });
    }
    setIsSubmitting(false);
  };

  const animStyle: React.CSSProperties =
    animState === "exit"
      ? { opacity: 0, transform: "translateX(-24px)", transition: "all 0.35s ease" }
      : animState === "enter"
      ? { opacity: 0, transform: "translateX(24px)" }
      : { opacity: 1, transform: "translateX(0)", transition: "all 0.4s ease" };

  const current = messages[currentIndex];

  return (
    <div className="w-full max-w-4xl space-y-3 mt-4">
      <div
        className="relative rounded-2xl border border-indigo-200/60 px-8 pt-6 flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #ede9fe 100%)",
          paddingBottom: messages.length > 1 ? "2.5rem" : "1.5rem",
          minHeight: "120px",
        }}
      >
        {/* Decorative quote mark */}
        <span
          className="absolute top-2 left-4 text-7xl font-serif leading-none select-none pointer-events-none"
          style={{ color: "rgba(99, 102, 241, 0.15)" }}
        >
          &ldquo;
        </span>

        {/* Message */}
        <div className="text-center z-10 w-full" style={animStyle}>
          {current ? (
            <>
              <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed break-words hyphens-auto">
                &ldquo;{current.pesan}&rdquo;
              </p>
              <p className="text-sm text-indigo-400 font-medium mt-2">— {current.nama}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Belum ada pesan hari ini. Yuk bagikan semangatmu! 💪
            </p>
          )}
        </div>

        {/* Dot indicators */}
        {messages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 flex-wrap justify-center max-w-[80%]">
            {messages.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? "20px" : "6px",
                  background: i === currentIndex ? "#6366f1" : "#c7d2fe",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
          {isSubmitting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
