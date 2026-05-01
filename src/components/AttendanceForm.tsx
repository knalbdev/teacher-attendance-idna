
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitAttendance, submitMessage } from "@/app/actions";

const MOODS = ['💪', '😊', '😴', '🤔', '🙏', '✨'];
import { data, jpData, type Level } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  level: z.string({ required_error: "Kolom ini wajib diisi." }).min(1, "Kolom ini wajib diisi."),
  class: z.string({ required_error: "Kolom ini wajib diisi." }).min(1, "Kolom ini wajib diisi."),
  teacher: z.string({ required_error: "Kolom ini wajib diisi." }).min(1, "Kolom ini wajib diisi."),
  jp: z.string({ required_error: "Kolom ini wajib diisi." }).min(1, "Kolom ini wajib diisi."),
  otherTeacher: z.string().optional(),
  photo: z.string({ required_error: "Foto wajib diambil." }).min(1, "Foto wajib diambil."),
}).superRefine((data, ctx) => {
    if (data.teacher === 'Other' && (!data.otherTeacher || data.otherTeacher.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherTeacher'],
            message: 'Nama guru wajib diisi jika memilih "Lainnya".',
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

export default function AttendanceForm() {
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<string[]>([]);
  const [levelOptions, setLevelOptions] = useState<string[]>([]);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState<'prompt' | 'form'>('prompt');
  const [msgNama, setMsgNama] = useState('');
  const [msgPesan, setMsgPesan] = useState('');
  const [msgMood, setMsgMood] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: "",
      class: "",
      teacher: "",
      jp: "",
      otherTeacher: "",
      photo: "",
    },
  });

  const level = form.watch("level");
  const classValue = form.watch("class");
  const jpValue = form.watch("jp");
  const teacher = form.watch("teacher");
  const photo = form.watch("photo");

  useEffect(() => {
    setLevelOptions(Object.keys(data));
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (isCameraStarting || isCameraOn) return;
    setIsCameraStarting(true);
    setHasCameraPermission(null);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              setIsCameraStarting(false);
              setIsCameraOn(true);
            };
        } else {
          setIsCameraStarting(false);
        }
    } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        toast({
            variant: "destructive",
            title: "Error Kamera",
            description: "Tidak bisa mengakses kamera. Aktifkan izin kamera di browser.",
        });
        setIsCameraStarting(false);
    }
  }, [isCameraStarting, isCameraOn, toast]);

  useEffect(() => {
    if (level) {
      const selectedLevelData = data[level as Level];
      setClassOptions(selectedLevelData.class);
      setTeacherOptions([...selectedLevelData.teacher]);
      form.resetField("class", { defaultValue: "" });
      form.resetField("teacher", { defaultValue: "" });
      form.resetField("jp", { defaultValue: "" });
      form.resetField("otherTeacher", { defaultValue: "" });
    } else {
      setClassOptions([]);
      setTeacherOptions([]);
    }
  }, [level, form]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 3) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const MAX_WIDTH = 640;
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        form.setValue("photo", dataUrl, { shouldValidate: true });
        stopCamera();
      }
    } else {
        toast({
          variant: "destructive",
          title: "Kamera Belum Siap",
          description: "Kamera belum siap. Tunggu sebentar dan coba lagi.",
        });
    }
  };

  const retakePhoto = () => {
    form.setValue("photo", "", { shouldValidate: true });
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  async function onSubmit(values: FormValues) {
    const submissionData = {
        level: values.level,
        class: values.class,
        teacher: values.teacher === 'Other' ? values.otherTeacher || '' : values.teacher,
        jp: values.jp,
        photo: values.photo,
    };

    const result = await submitAttendance(submissionData);
    if (result.success) {
      form.reset();
      form.setValue("photo", "");
      setDialogStep('prompt');
      setMsgNama('');
      setMsgPesan('');
      setMsgMood('');
      setShowDialog(true);
    } else {
      toast({
        variant: "destructive",
        title: "Gagal Mengirim",
        description: result.message,
      });
    }
  }

  const handleSendMessage = async () => {
    if (!msgNama.trim() || !msgPesan.trim()) return;
    setIsSendingMsg(true);
    const result = await submitMessage(msgNama.trim(), msgPesan.trim(), msgMood || undefined);
    setIsSendingMsg(false);
    if (result.success) {
      setShowDialog(false);
      setMsgNama('');
      setMsgPesan('');
      setMsgMood('');
      window.dispatchEvent(new CustomEvent('message-sent'));
      toast({ title: "Terkirim!", description: "Kata-kata semangatmu sudah terkirim!" });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: result.message });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:items-stretch">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Jenjang</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {levelOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kelas</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!level}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {classOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="jp"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>JP</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!classValue}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih JP" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {jpData.map((item) => (
                                <SelectItem key={item.jp} value={`${item.jp} (${item.time})`}>
                                    {item.jp} ({item.time})
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="teacher"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Guru</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== 'Other') {
                                    form.setValue('otherTeacher', '');
                                }
                            }} value={field.value} disabled={!jpValue}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Nama Guru" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {teacherOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {teacher === 'Other' && (
                        <FormField
                            control={form.control}
                            name="otherTeacher"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nama Guru Lainnya</FormLabel>
                                <FormControl>
                                    <Input placeholder="Masukkan nama guru" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                </div>

                <div className="flex flex-col h-full">
                    <FormField
                        control={form.control}
                        name="photo"
                        render={() => (
                        <FormItem className="flex flex-col h-full">
                            <FormLabel>Foto Absensi</FormLabel>
                            <FormControl className="flex-1 min-h-0">
                                <div className="w-full h-full min-h-[200px] p-2 border-dashed border-2 rounded-lg flex items-center justify-center bg-muted/50 relative">
                                    {photo ? (
                                        <div className="relative w-full h-full">
                                            <img src={photo} alt="Absensi" className="rounded-md w-full h-full object-cover" />
                                            <Button type="button" size="icon" variant="destructive" className="absolute -top-3 -right-3 rounded-full shadow-lg" onClick={retakePhoto}>
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`w-full h-full relative ${!isCameraOn ? 'hidden' : 'block'}`}>
                                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-md" />
                                                <Button type="button" onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                                                    <Camera className="mr-2 h-4 w-4" /> Ambil Foto
                                                </Button>
                                            </div>
                                            <div className={`absolute inset-0 flex flex-col gap-4 items-center justify-center ${isCameraOn ? 'hidden' : ''}`}>
                                                <Button type="button" variant="outline" onClick={startCamera} disabled={isCameraStarting}>
                                                    {isCameraStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                                                    Aktifkan Kamera
                                                </Button>
                                                {hasCameraPermission === false && (
                                                    <Alert variant="destructive">
                                                        <AlertTitle>Akses Kamera Ditolak</AlertTitle>
                                                        <AlertDescription>
                                                            Aktifkan izin kamera di pengaturan browser.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Absensi
          </Button>
        </form>
      </Form>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) setShowDialog(false); }}>
        <DialogContent className="sm:max-w-sm">
          {dialogStep === 'prompt' ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border border-green-100">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <DialogTitle className="text-center text-lg">Absensi Berhasil!</DialogTitle>
                <DialogDescription className="text-center text-sm">
                  Mau berbagi kata-kata semangat untuk rekan guru hari ini?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button onClick={() => setDialogStep('form')} className="w-full">
                  Ya, mau!
                </Button>
                <Button variant="ghost" onClick={() => setShowDialog(false)} className="w-full text-muted-foreground">
                  Nanti saja
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Bagikan Semangatmu</DialogTitle>
                <DialogDescription>Kata-katamu bisa menginspirasi rekan-rekan yang lain!</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Nama kamu"
                  value={msgNama}
                  onChange={(e) => setMsgNama(e.target.value)}
                  maxLength={50}
                />
                <div className="relative">
                  <Textarea
                    placeholder="Tulis kata-kata semangatmu..."
                    value={msgPesan}
                    onChange={(e) => setMsgPesan(e.target.value)}
                    className="resize-none pr-14"
                    maxLength={200}
                    rows={3}
                  />
                  <span className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
                    {msgPesan.length}/200
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Mood:</span>
                  {MOODS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMsgMood(msgMood === emoji ? '' : emoji)}
                      className={`text-xl p-1.5 rounded-lg transition-all ${
                        msgMood === emoji
                          ? 'bg-primary/10 ring-2 ring-primary/30 scale-110'
                          : 'opacity-50 hover:opacity-100 hover:bg-muted'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={isSendingMsg || !msgNama.trim() || !msgPesan.trim()}
                  onClick={handleSendMessage}
                  className="w-full"
                >
                  {isSendingMsg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Kirim
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
