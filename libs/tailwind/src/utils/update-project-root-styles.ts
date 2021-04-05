import type { workspaces } from '@angular-devkit/core';
import { JsonArray, normalize } from '@angular-devkit/core';
import type { Rule, Tree } from '@angular-devkit/schematics';

const TAILWIND_CSS_FILEPATH = 'node_modules/tailwindcss/tailwind.css';
const TAILWIND_STYLE_IMPORTS = `@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';`;
const defaultStyleFileRegex = /(styles|global)\.(c|le|sc|sa)ss/;

/**
 * Adding tailwind imports either to 'styles.(scss|less|css|sass)'
 * If not possible, we're simply adding 'tailwind.css' to the 'angular.json'
 */
export function updateProjectRootStyles(
  projectName: string,
  getWorkspace: (
    tree: Tree,
    path?: string
  ) => Promise<workspaces.WorkspaceDefinition>,
  updateWorkspace: (workspace: workspaces.WorkspaceDefinition) => Rule
): Rule {
  return (tree) => {
    return getWorkspace(tree).then((workspace) => {
      const project = workspace.projects.get(projectName);
      const targetOptions = project.targets.get('build').options;
      const styleFilePath = getProjectStyleFile(targetOptions) || '';

      if (styleFilePath) {
        return addTailwindToStylesFile(styleFilePath);
      }
      addTailwindToAngularJson(targetOptions, tree);
      return updateWorkspace(workspace);
    }) as ReturnType<Rule>;
  };
}

/**
 * Patches 'styles' file to add Tailwind snippet
 */
function addTailwindToStylesFile(styleFilePath: string): Rule {
  return (tree, context) => {
    const styleContent = tree.read(styleFilePath)?.toString('utf-8');

    if (styleContent?.includes(`@import 'tailwindcss`)) {
      context.logger.error(
        `Your styles (${styleFilePath}) already contains tailwindcss imports`
      );
      return;
    }
    const recorder = tree.beginUpdate(styleFilePath);
    recorder.insertLeft(-1, `${TAILWIND_STYLE_IMPORTS}\n`);

    tree.commitUpdate(recorder);
  };
}

/**
 * Patches 'angular.json' to add 'tailwind.css' styles
 */
function addTailwindToAngularJson(
  targetOptions: workspaces.TargetDefinition['options'],
  tree: Tree
): Rule {
  const styles = targetOptions.styles as JsonArray | undefined;
  if (!styles) {
    targetOptions.styles = [TAILWIND_CSS_FILEPATH];
  } else {
    const existingStyles = styles.map((s) =>
      typeof s === 'string' ? s : s['input'] ? s['input'] : ''
    );

    for (const [, stylePath] of existingStyles.entries()) {
      // If the given asset is already specified in the styles, we don't need to do anything.
      if (stylePath === TAILWIND_CSS_FILEPATH) {
        return () => tree;
      }
    }
    styles.unshift(TAILWIND_CSS_FILEPATH);
  }
}

function getProjectStyleFile(
  targetOptions: workspaces.TargetDefinition['options'],
  extension?: string
): string | null {
  if (!targetOptions) {
    return '';
  }

  if (
    targetOptions.styles &&
    Array.isArray(targetOptions.styles) &&
    targetOptions.styles.length
  ) {
    const styles = targetOptions.styles.map((s) =>
      typeof s === 'string' ? s : s['input'] ? s['input'] : ''
    );

    // Look for the default style file that is generated for new projects by the Angular CLI. This
    // default style file is usually called `styles.ext` unless it has been changed explicitly.
    const defaultMainStylePath = styles.find((file) =>
      extension
        ? file === `styles.${extension}`
        : defaultStyleFileRegex.test(file)
    );

    if (defaultMainStylePath) {
      return normalize(defaultMainStylePath);
    }

    return '';
  }

  return null;
}
