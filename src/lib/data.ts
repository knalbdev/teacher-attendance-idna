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
    guru: ['Aisyah', 'Fatimah', 'Khadijah', 'Zainab'],
  },
  SMK: {
    kelas: ['Kelas 10 RPL', 'Kelas 10 TKJ', 'Kelas 11 RPL', 'Kelas 11 TKJ', 'Kelas 12 RPL', 'Kelas 12 TKJ'],
    guru: ['Siti', 'Maryam', 'Hafsah', 'Juwairiyah'],
  },
};
