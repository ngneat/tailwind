export type TailwindDarkMode = 'none' | 'class' | 'media';

export interface TailwindSchematicsOptions {
  project: string;
  enableJit: boolean;
  darkMode: TailwindDarkMode;
  plugins: string | string[];
}

export interface NormalizedTailwindSchematicsOptions
  extends TailwindSchematicsOptions {
  projectName?: string;
  projectRoot?: string;
  sourceRoot?: string;
  projectDirectory?: string;
  appsDir?: string;
  libsDir?: string;
  dependencies?: string[];
}
