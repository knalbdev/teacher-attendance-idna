import AttendanceForm from '@/components/AttendanceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-background">
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
              <Image src="/logo.png" alt="Logo" width={80} height={80} className="rounded-full" />
          </div>
          <Card className="shadow-xl rounded-2xl border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline tracking-tight">Teacher Attendance System</CardTitle>
              <CardDescription className="font-body text-base">
                IDN Boarding School Akhwat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceForm />
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-6">
            IDN Boarding School &copy; {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}
