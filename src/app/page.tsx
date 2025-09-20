import AttendanceForm from '@/components/AttendanceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-background">
      <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-full border border-primary/20">
                  <School className="h-10 w-10 text-primary" />
              </div>
          </div>
          <Card className="shadow-xl rounded-2xl border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline tracking-tight">TAS Akhwat</CardTitle>
              <CardDescription className="font-body text-base">
                Teacher Attendance System
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
