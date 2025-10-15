
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
    class: ['7A', '7B', '8A', '8B', '9A', '9B'],
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
        'Ratih Eldina',
        'Annisa Rahayu',
        'Haura Salsabila Az-Zahra',
        'Rasitania Ayudya',
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
        'Annisa Rahayu',
        'Haura Salsabila Az-Zahra',
        'Rasitania Ayudya',
        'Other'
    ],
  },
};

export const jpData = [
    { jp: '1', time: '07:30' },
    { jp: '2', time: '08:15' },
    { jp: '3', time: '09:00' },
    { jp: '4', time: '10:00' },
    { jp: '5', time: '10:45' },
    { jp: '6', time: '13:00' },
    { jp: '7', time: '13:45' },
];
