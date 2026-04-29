"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Send } from "lucide-react";
import { getMessages, submitMessage } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Message {
  nama: string;
  pesan: string;
}

export default function MessageTicker() {
  const [messages, setMessages] = useState<Message[]>([]);
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
    const interval = setInterval(loadMessages, 30000);
    return () => clearInterval(interval);
  }, [loadMessages]);

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

  const tickerText =
    messages.length > 0
      ? messages.map((m) => `💬 "${m.pesan}" — ${m.nama}`).join("   ✦   ")
      : "Belum ada pesan hari ini. Yuk bagikan semangatmu untuk teman-teman! 💪";

  return (
    <div className="w-full max-w-4xl space-y-3 mt-4">
      <div className="bg-primary/5 border border-primary/20 rounded-xl py-2.5 overflow-hidden">
        <div className="flex w-max animate-marquee">
          <span className="text-sm text-primary/80 px-8 whitespace-nowrap">{tickerText}</span>
          <span className="text-sm text-primary/80 px-8 whitespace-nowrap" aria-hidden>{tickerText}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Nama kamu"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-36 shrink-0"
          maxLength={50}
        />
        <Input
          placeholder="Tulis kata-kata semangatmu..."
          value={pesan}
          onChange={(e) => setPesan(e.target.value)}
          className="flex-1"
          maxLength={200}
        />
        <Button type="submit" disabled={isSubmitting} size="sm" className="shrink-0">
          {isSubmitting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
