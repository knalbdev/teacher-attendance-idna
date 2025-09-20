export type Jenjang = 'SMP' | 'SMK';

export const jenjangOptions: Jenjang[] = ['SMP', 'SMK'];

interface AppData {
  [key: string]: {
    kelas: string[];
    guru: string[];
  };
}

export const data: AppData = {
  SMP: {
    kelas: ['Kelas 7A', 'Kelas 7B', 'Kelas 8A', 'Kelas 8B', 'Kelas 9A', 'Kelas 9B'],
    guru: [
        'Adinda Eka Febrianti',
        'Anisa',
        'Anisah Nurul Azhar',
        'Nadia Auliya Damayanti',
        'Isha Rani Al Fitrah',
        'Annisa Farah',
        'Fatimah Azzahra',
        'Divaretta Kiesa Sumartha',
        'Widya Aini',
        'Tifany Fadianisah',
        'Khansa Meisastia',
        'Annisa Rahayu',
        'Haura Salsabila Az-Zahra'
    ],
  },
  SMK: {
    kelas: ['10 DKV', '10 RPL', '11 DKV', '11 RPL'],
    guru: [
        'Wida Mudrikah',
        'Setianing Budi',
        'Mane Mint Dahi',
        'Andrea Dorea Aviarini',
        'Hifni Fadhilah',
        'Agisti Indah Sari',
        'Luluk Yulianti',
        'Ridha Mujahidah Fajri Islami',
        'Tri Wahyu Nengsih',
        'Salwa',
        'Ratih Eldina'
    ],
  },
};
