import AttendanceForm from '@/components/AttendanceForm';
import MessageTicker from '@/components/MessageTicker';
import Image from 'next/image';

export default function Home() {
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(155deg, #eef2ff 0%, #f8fafc 40%)' }}
    >
      <main className="flex min-h-screen w-full flex-col items-center p-4 pt-5">
        <div className="w-full max-w-4xl space-y-4">

          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-xl overflow-hidden shadow ring-1 ring-slate-200/80">
              <Image src="/logo.png" alt="Logo" width={64} height={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sistem Absensi Guru
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">IDN Boarding School Akhwat</p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/60 p-4 sm:p-6">
            <AttendanceForm />
          </div>

          <MessageTicker />

          <p className="text-center text-xs text-slate-400 pb-2">
            IDN Boarding School Akhwat &copy; {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}
