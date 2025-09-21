'use server';

import { z } from 'zod';

const formSchema = z.object({
  level: z.string().min(1, 'Grade is required.'),
  class: z.string().min(1, 'Class is required.'),
  teacher: z.string().min(1, 'Teacher Name is required.'),
  photo: z.string().min(1, 'Photo is required.'),
});

type AttendanceData = z.infer<typeof formSchema>;

export async function submitAttendance(data: AttendanceData): Promise<{ success: boolean; message: string; }> {

  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided: ' + validatedFields.error.flatten().fieldErrors,
    };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('N8N_WEBHOOK_URL is not set. Simulating successful submission.');
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
    guru: validatedFields.data.teacher,
    foto: validatedFields.data.photo,
    timestamp,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook submission failed:', errorText);
      return { success: false, message: `Webhook submission failed: ${response.statusText}` };
    }

    return { success: true, message: 'Attendance submitted successfully!' };
  } catch (error) {
    console.error('Error submitting to webhook:', error);
    if (error instanceof Error) {
        return { success: false, message: `An error occurred: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
