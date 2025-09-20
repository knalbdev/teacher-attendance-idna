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
    kelas: ['10 DKV', '10 RPL', '11 DKV', '11 RPL'],
    guru: [],
  },
};
