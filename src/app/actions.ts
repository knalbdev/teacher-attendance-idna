'use server';

import { z } from 'zod';

export async function getMessages(): Promise<Array<{ nama: string; pesan: string; mood?: string }>> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return [];
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json() as { success: boolean; messages?: Array<{ nama: string; pesan: string; mood?: string }> };
    return data.success ? (data.messages ?? []) : [];
  } catch {
    return [];
  }
}

export async function submitMessage(nama: string, pesan: string, mood?: string): Promise<{ success: boolean; message: string }> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) return { success: false, message: 'URL not configured.' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'pesan', nama, pesan, ...(mood ? { mood } : {}) }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) return { success: false, message: 'Submission failed.' };
    const result = await response.json() as { success: boolean; error?: string };
    return result.success
      ? { success: true, message: 'Message sent!' }
      : { success: false, message: result.error ?? 'Unknown error.' };
  } catch (error) {
    clearTimeout(timer);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: true, message: 'Message sent!' };
    }
    return { success: false, message: 'An error occurred.' };
  }
}

const formSchema = z.object({
  level: z.string().min(1, 'Grade is required.'),
  class: z.string().min(1, 'Class is required.'),
  teacher: z.string().min(1, 'Teacher Name is required.'),
  jp: z.string().min(1, 'JP is required.'),
  photo: z.string().min(1, 'Photo is required.'),
});

type AttendanceData = z.infer<typeof formSchema>;

const TIMEOUT_MS = 5000;

export async function submitAttendance(data: AttendanceData): Promise<{ success: boolean; message: string; }> {

  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided: ' + validatedFields.error.flatten().fieldErrors,
    };
  }

  const webhookUrl = process.env.APPS_SCRIPT_URL;

  if (!webhookUrl) {
    console.log('APPS_SCRIPT_URL is not set. Simulating successful submission.');
    return { success: true, message: 'Attendance submitted successfully! (Simulated)' };
  }

  const now = new Date();
  const timestamp = now.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour12: false,
  }).replace(/\./g, ':').replace(',', '');

  const payload = {
    jenjang: validatedFields.data.level,
    kelas: validatedFields.data.class,
    jp: validatedFields.data.jp,
    guru: validatedFields.data.teacher,
    foto: validatedFields.data.photo,
    timestamp,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submission failed:', errorText);
      return { success: false, message: `Submission failed: ${response.statusText}` };
    }

    const result = await response.json() as { success: boolean; error?: string };
    if (!result.success) {
      console.error('Apps Script error:', result.error);
      return { success: false, message: `Apps Script error: ${result.error ?? 'Unknown error'}` };
    }

    return { success: true, message: 'Attendance submitted successfully!' };
  } catch (error) {
    clearTimeout(timer);
    // Timeout — Apps Script still processing in background, assume success
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Apps Script timeout — processing in background');
      return { success: true, message: 'Attendance submitted successfully!' };
    }
    console.error('Error submitting attendance:', error);
    if (error instanceof Error) {
      return { success: false, message: `An error occurred: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
