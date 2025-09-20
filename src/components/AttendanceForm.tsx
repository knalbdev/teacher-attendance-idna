
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitAttendance } from "@/app/actions";
import { data, jenjangOptions, type Jenjang } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  jenjang: z.string({ required_error: "Please select a Jenjang." }).min(1),
  kelas: z.string({ required_error: "Please select a Kelas." }).min(1),
  guru: z.string({ required_error: "Please select a Nama Guru." }).min(1),
  guruLainnya: z.string().optional(),
  photo: z.string({ required_error: "Please take a photo." }).min(1),
}).superRefine((data, ctx) => {
    if (data.guru === 'Lainnya' && (!data.guruLainnya || data.guruLainnya.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['guruLainnya'],
            message: 'Nama Guru harus diisi jika memilih "Lainnya".',
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

export default function AttendanceForm() {
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [guruOptions, setGuruOptions] = useState<string[]>([]);
  
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenjang: "",
      kelas: "",
      guru: "",
      guruLainnya: "",
      photo: "",
    },
  });

  const jenjang = form.watch("jenjang");
  const guru = form.watch("guru");

  useEffect(() => {
    if (jenjang) {
      const selectedJenjangData = data[jenjang as Jenjang];
      setKelasOptions(selectedJenjangData.kelas);
      setGuruOptions(selectedJenjangData.guru);
      form.resetField("kelas", { defaultValue: "" });
      form.resetField("guru", { defaultValue: "" });
      form.resetField("guruLainnya", { defaultValue: "" });
    } else {
      setKelasOptions([]);
      setGuruOptions([]);
    }
  }, [jenjang, form]);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setHasCameraPermission(true);
        setIsCameraOn(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: "Could not access camera. Please enable permissions in your browser.",
        });
      }
    } else {
       setHasCameraPermission(false);
       toast({
          variant: "destructive",
          title: "Camera Not Supported",
          description: "Your browser does not support camera access.",
        });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL("image/jpeg");
      form.setValue("photo", dataUrl, { shouldValidate: true });
      stopCamera();
    }
  };

  const retakePhoto = () => {
    form.setValue("photo", "", { shouldValidate: false });
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: FormValues) {
    const submissionData = {
        ...values,
        guru: values.guru === 'Lainnya' ? values.guruLainnya || '' : values.guru,
    };
    // We don't need guruLainnya in the final submission
    const { guruLainnya, ...finalData } = submissionData;

    const result = await submitAttendance(finalData);
    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      });
      form.reset();
      form.setValue("photo", "");
    } else {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: result.message,
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="jenjang"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Jenjang</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Jenjang" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {jenjangOptions.map((option) => (
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
                        name="kelas"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Kelas</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!jenjang}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Kelas" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {kelasOptions.map((option) => (
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
                        name="guru"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Guru</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== 'Lainnya') {
                                    form.setValue('guruLainnya', '');
                                }
                            }} value={field.value} disabled={!jenjang}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Pilih Nama Guru" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {guruOptions.map((option) => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    {guru === 'Lainnya' && (
                        <FormField
                            control={form.control}
                            name="guruLainnya"
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
                <div>
                    <FormField
                        control={form.control}
                        name="photo"
                        render={() => (
                        <FormItem>
                            <FormLabel>Attendance Photo</FormLabel>
                            <FormControl>
                                <div className="w-full p-2 border-dashed border-2 rounded-lg flex flex-col items-center justify-center min-h-[200px] bg-muted/50 aspect-video">
                                    {form.getValues("photo") ? (
                                        <div className="relative w-full">
                                            <img src={form.getValues("photo")} alt="Attendance" className="rounded-md w-full" />
                                            <Button type="button" size="icon" variant="destructive" className="absolute -top-3 -right-3 rounded-full shadow-lg" onClick={retakePhoto}>
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : isCameraOn ? (
                                        <div className="w-full flex flex-col items-center gap-4">
                                            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
                                            <Button type="button" onClick={capturePhoto}><Camera className="mr-2 h-4 w-4" /> Capture</Button>
                                        </div>
                                    ) : (
                                    <>
                                        <Button type="button" variant="outline" onClick={startCamera}>
                                            <Camera className="mr-2 h-4 w-4" /> Enable Camera
                                        </Button>
                                        {hasCameraPermission === false && (
                                            <Alert variant="destructive" className="mt-4">
                                                <AlertTitle>Camera Access Denied</AlertTitle>
                                                <AlertDescription>
                                                    Please enable camera permissions in your browser settings.
                                                </AlertDescription>
                                            </Alert>
                                        )}
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
            Submit Attendance
          </Button>
        </form>
      </Form>
    </>
  );
}
