'use server';

import { z } from 'zod';

const formSchema = z.object({
  level: z.string().min(1, 'Grade is required.'),
  class: z.string().min(1, 'Class is required.'),
  teacher: z.string().min(1, 'Teacher Name is required.'),
  jp: z.string().min(1, 'JP is required.'),
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

  const postOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };

  try {
    // Apps Script redirects POST to a different URL — follow manually to keep POST method
    let response = await fetch(webhookUrl, { ...postOptions, redirect: 'manual' });

    if (response.status === 301 || response.status === 302) {
      const redirectUrl = response.headers.get('location');
      if (!redirectUrl) {
        return { success: false, message: 'Redirect URL not found.' };
      }
      response = await fetch(redirectUrl, postOptions);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submission failed:', errorText);
      return { success: false, message: `Submission failed: ${response.statusText}` };
    }

    const result = await response.json() as { success: boolean; error?: string };
    if (!result.success) {
      console.error('Apps Script error:', result.error);
      return { success: false, message: `Error: ${result.error ?? 'Unknown error from Apps Script'}` };
    }

    return { success: true, message: 'Attendance submitted successfully!' };
  } catch (error) {
    console.error('Error submitting attendance:', error);
    if (error instanceof Error) {
      return { success: false, message: `An error occurred: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
