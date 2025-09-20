
'use server';

import { z } from 'zod';

const formSchema = z.object({
  jenjang: z.string().min(1, 'Jenjang is required.'),
  kelas: z.string().min(1, 'Kelas is required.'),
  guru: z.string().min(1, 'Nama Guru is required.'),
  photo: z.string().min(1, 'Photo is required.'),
});

type AttendanceData = z.infer<typeof formSchema>;

export async function submitAttendance(data: AttendanceData): Promise<{ success: boolean; message: string; }> {

  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid data provided.',
    };
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://webhook.site/b17a151b-2546-4702-8610-c97b819d43d5'; // Placeholder

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
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
