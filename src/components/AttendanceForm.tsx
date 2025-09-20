
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { submitAttendance } from "@/app/actions";
import { data, type Level, levelOptions } from "@/lib/data";
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
  level: z.string({ required_error: "Grade is required." }).min(1, "Grade is required."),
  class: z.string({ required_error: "Class is required." }).min(1, "Class is required."),
  teacher: z.string({ required_error: "Teacher's Name is required." }).min(1, "Teacher's Name is required."),
  otherTeacher: z.string().optional(),
  photo: z.string({ required_error: "A photo is required." }).min(1, "A photo is required."),
}).superRefine((data, ctx) => {
    if (data.teacher === 'Other' && (!data.otherTeacher || data.otherTeacher.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['otherTeacher'],
            message: 'Teacher name must be filled if "Other" is selected.',
        });
    }
});

type FormValues = z.infer<typeof formSchema>;

export default function AttendanceForm() {
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<string[]>([]);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level: "",
      class: "",
      teacher: "",
      otherTeacher: "",
      photo: "",
    },
  });

  const level = form.watch("level");
  const teacher = form.watch("teacher");
  const photo = form.watch("photo");

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
            title: "Camera Error",
            description: "Could not access camera. Please enable permissions in your browser.",
        });
        setIsCameraStarting(false);
    }
  }, [isCameraStarting, isCameraOn, toast]);

  useEffect(() => {
    if (level) {
      const selectedLevelData = data[level as Level];
      setClassOptions(selectedLevelData.class);
      setTeacherOptions([...selectedLevelData.teacher, 'Other']);
      form.resetField("class", { defaultValue: "" });
      form.resetField("teacher", { defaultValue: "" });
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL("image/jpeg");
        form.setValue("photo", dataUrl, { shouldValidate: true });
        stopCamera();
      }
    } else {
        toast({
          variant: "destructive",
          title: "Camera Not Ready",
          description: "The camera is not ready yet. Please wait a moment and try again.",
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
        ...values,
        teacher: values.teacher === 'Other' ? values.otherTeacher || '' : values.teacher,
    };
    // We don't need otherTeacher in the final submission
    const { otherTeacher, ...finalData } = submissionData;

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
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
                            <FormLabel>Class</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!level}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
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
                        name="teacher"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Teacher's Name</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== 'Other') {
                                    form.setValue('otherTeacher', '');
                                }
                            }} value={field.value} disabled={!level}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select Teacher's Name" /></SelectTrigger>
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
                                <FormLabel>Other Teacher's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter teacher's name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    )}
                </div>
                <div className="flex flex-col">
                    <FormField
                        control={form.control}
                        name="photo"
                        render={() => (
                        <FormItem className="flex flex-col h-full">
                            <FormLabel>Attendance Photo</FormLabel>
                            <FormControl className="flex-grow">
                                <div className="w-full h-full p-2 border-dashed border-2 rounded-lg flex flex-col items-center justify-center bg-muted/50 aspect-video">
                                    {photo ? (
                                        <div className="relative w-full">
                                            <img src={photo} alt="Attendance" className="rounded-md w-full" />
                                            <Button type="button" size="icon" variant="destructive" className="absolute -top-3 -right-3 rounded-full shadow-lg" onClick={retakePhoto}>
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                            <div className="w-full relative flex-grow flex items-center justify-center">
                                                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-md ${!isCameraOn ? 'hidden' : ''}`} />
                                                <div className={`absolute inset-0 flex items-center justify-center ${isCameraOn ? 'hidden' : ''}`}>
                                                    <Button type="button" variant="outline" onClick={startCamera} disabled={isCameraStarting}>
                                                      {isCameraStarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                                                      Enable Camera
                                                    </Button>
                                                </div>
                                            </div>

                                            {hasCameraPermission === false && (
                                                 <Alert variant="destructive" className="mt-4">
                                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                                    <AlertDescription>
                                                        Please enable camera permissions in your browser settings.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {isCameraOn && (
                                                <Button type="button" onClick={capturePhoto} className="mt-2"><Camera className="mr-2 h-4 w-4" /> Capture</Button>
                                            )}
                                        </div>
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
    
