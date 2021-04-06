import type { Tree } from '@angular-devkit/schematics';

export function isNx(tree: Tree): boolean {
  return tree.exists('./nx.json');
}
