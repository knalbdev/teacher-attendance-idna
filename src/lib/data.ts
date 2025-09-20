
export type Level = 'SMP' | 'SMK';

export const levelOptions: Level[] = ['SMP', 'SMK'];

interface AppData {
  [key: string]: {
    class: string[];
    teacher: string[];
  };
}

export const data: AppData = {
  'SMP': {
    class: ['Class 7A', 'Class 7B', 'Class 8A', 'Class 8B', 'Class 9A', 'Class 9B'],
    teacher: [
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
        'Haura Salsabila Az-Zahra',
        'Other'
    ],
  },
  'SMK': {
    class: ['10 DKV', '10 RPL', '11 DKV', '11 RPL'],
    teacher: [
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
        'Ratih Eldina',
        'Other'
    ],
  },
};
