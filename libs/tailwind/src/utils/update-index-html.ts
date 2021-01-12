import type { workspaces } from '@angular-devkit/core';
import type { Rule } from '@angular-devkit/schematics';
import { TailwindDarkMode } from '../schematics/schema';

export function updateIndexHtml(
  projectName: string,
  darkMode: TailwindDarkMode,
  updateWorkspaceFn: (
    updater: (
      workspace: workspaces.WorkspaceDefinition
    ) => void | PromiseLike<void>
  ) => Rule
): Rule {
  return (tree, context) => {
    if (darkMode === 'class') {
      return updateWorkspaceFn((workspace) => {
        const project = workspace.projects.get(projectName);
        const indexPath = project?.targets.get('build').options
          ?.index as string;
        const indexContent = tree.get(indexPath).content.toString();
        tree.overwrite(
          indexPath,
          indexContent.replace('<body>', '<body class="dark">')
        );
      })(tree, context);
    }
  };
}
