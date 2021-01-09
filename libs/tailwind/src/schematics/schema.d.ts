export type TailwindDarkMode = 'none' | 'class' | 'media';

export interface TailwindSchematicsOptions {
  project: string;
  darkMode: TailwindDarkMode;
  enableTailwindInComponentsStyles: boolean;
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
