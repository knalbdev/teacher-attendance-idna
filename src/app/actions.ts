
'use server';

import { z } from 'zod';

const formSchema = z.object({
  level: z.string().min(1, 'Level is required.'),
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
      message: 'Invalid data provided.',
    };
  }

  // TODO: Replace with your n8n webhook URL in your .env.local file
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('N8N_WEBHOOK_URL is not set.');
    return { success: false, message: 'Webhook URL is not configured.' };
  }

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
