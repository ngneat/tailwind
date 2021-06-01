export function getTailwindImports(): string {
  return `@use '~tailwindcss/base';
@use '~tailwindcss/components';
@use '~tailwindcss/utilities';\n`;
}
