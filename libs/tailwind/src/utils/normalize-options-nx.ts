import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
  getProjectGraphFromHost,
  ProjectGraph,
  ProjectGraphNode,
  projectRootDir,
  ProjectType,
} from '@nrwl/workspace';
import { appsDir, libsDir } from '@nrwl/workspace/src/utils/ast-utils';
import {
  NormalizedTailwindSchematicsOptions,
  TailwindSchematicsOptions,
} from '../schematics/schema';
import { getDependencies } from './get-dependencies';

export function getDefaultProjectFromGraph(
  graph: ProjectGraph,
  projectName?: string
): ProjectGraphNode {
  if (projectName) return graph.nodes[projectName];
  return Object.values(graph.nodes).find(
    (node) =>
      node.type === 'app' &&
      node.data.projectType === ProjectType.Application &&
      Object.values(node.data.architect).some((target) =>
        (target as any).builder.includes('angular')
      )
  );
}

export function normalizeOptionsNx(
  options: TailwindSchematicsOptions,
  tree: Tree,
  context: SchematicContext
): NormalizedTailwindSchematicsOptions {
  const { plugins, dependencies } = getDependencies(options.plugins);
  const darkMode = options.darkMode || 'none';

  const project = getDefaultProjectFromGraph(
    getProjectGraphFromHost(tree),
    options.project
  );

  if (project == null) {
    const msg = `Cannot find any Angular project in the current workspace.`;
    context.logger.fatal(msg);
    throw new Error(msg);
  }

  return {
    ...options,
    project: project.name,
    projectName: project.name,
    projectDirectory: project.data.root
      .split(projectRootDir(ProjectType.Application) + '/')
      .pop(),
    projectRoot: project.data.root,
    appsDir: appsDir(tree),
    libsDir: libsDir(tree),
    darkMode,
    dependencies,
    plugins,
  };
}
