import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import { get } from 'lodash';
import { join } from 'path';

const schematicsTestOptions = {
  'nx-setup': {
    workspaceOptions: {
      name: 'workspace',
      style: 'scss',
      skipInstall: true,
      skipGit: true,
      commit: false,
      cli: 'angular',
      preset: 'empty',
    },
    appOptions: {
      name: 'foo',
      style: 'scss',
      routing: false,
      inlineStyle: true,
      inlineTemplate: true,
      skipTests: true,
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
    },
    workspaceSchematics: '@nrwl/workspace',
    appSchematics: '@nrwl/angular',
    stylesRootPath: './apps/foo/src/styles.scss',
  },
  'ng-add': {
    workspaceOptions: {
      name: 'workspace',
      newProjectRoot: 'projects',
      version: '10.2.0',
      defaultProject: 'foo',
    },
    appOptions: {
      name: 'foo',
      inlineStyle: false,
      inlineTemplate: false,
      routing: false,
      style: 'scss',
      skipTests: true,
      skipInstall: true,
      skipGit: true,
      minimal: true,
    },
    workspaceSchematics: '@schematics/angular',
    appSchematics: '@schematics/angular',
    stylesRootPath: './projects/foo/src/styles.scss',
  },
} as const;

function getProjectIndexPath(tree: UnitTestTree, projectName: string) {
  const workspace = JSON.parse(tree.readContent('/angular.json'));

  return get(
    workspace,
    `projects.${projectName}.architect.build.options.index`
  );
}

const collectionPath = join(__dirname, '../../../collection.json');

Object.entries(schematicsTestOptions).forEach(([schematic, options]) => {
  describe.skip(schematic, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner(
      '@ngneat/tailwind',
      collectionPath
    );

    beforeEach(async (done) => {
      appTree = await schematicRunner
        .runExternalSchematicAsync(
          options.workspaceSchematics,
          'workspace',
          options.workspaceOptions
        )
        .toPromise();

      appTree = await schematicRunner
        .runExternalSchematicAsync(
          options.appSchematics,
          'application',
          options.appOptions,
          appTree
        )
        .toPromise();
      done();
    });

    function assertDefaultPackages(packageJsonString: string) {
      expect(packageJsonString).toContain('tailwindcss');
    }

    function createStyleFile(tree, name) {
      ['css', 'scss', 'less'].forEach(() => {
        if (!tree.exists(name)) {
          tree.create(name, '');
        }
      });
    }

    function useStylesConfig(tree, config) {
      const workspace = JSON.parse(tree.readContent('./angular.json'));
      workspace.projects.foo.architect.build.options.styles = config;
      tree.overwrite('angular.json', JSON.stringify(workspace, null, 2));
    }

    function checkStylesFile(tree, stylesFile) {
      expect(tree.exists(stylesFile)).toEqual(true);
      const content = tree.readContent(stylesFile);
      const check = content.includes('tailwind');
      if (!check) {
        throw `Could not find tailwindcss imports in ${stylesFile}`;
      }
    }

    it('should add proper packages to devDependencies', async (done) => {
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          { style: 'scss', project: 'foo' },
          appTree
        )
        .toPromise();
      const packageJson = tree.readContent('./package.json');
      expect(packageJson).toBeTruthy();
      assertDefaultPackages(packageJson);
      done();
    });

    it('should have tailwind imports in styles', async (done) => {
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          { style: 'scss', project: 'foo' },
          appTree
        )
        .toPromise();
      const styles = tree.readContent(options.stylesRootPath);
      expect(styles).toBeTruthy();
      expect(styles).toContain('tailwindcss/base');
      expect(styles).toContain('tailwindcss/components');
      expect(styles).toContain('tailwindcss/utilities');
      done();
    });

    it('should add tailwind config to root', async (done) => {
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          { style: 'scss', project: 'foo' },
          appTree
        )
        .toPromise();
      expect(tree.exists('./tailwind.config.js')).toEqual(true);
      expect(tree.readContent('./tailwind.config.js')).toContain(
        `darkMode: false`
      );
      done();
    });

    it(`should add a tailwind config with darkMode set to 'class'`, async (done) => {
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          { style: 'scss', project: 'foo', darkMode: 'class' },
          appTree
        )
        .toPromise();
      expect(tree.readContent('./tailwind.config.js')).toContain(
        `darkMode: 'class'`
      );
      const indexPath = getProjectIndexPath(tree, 'foo');
      expect(tree.readContent(indexPath)).toContain('<body class="dark">');
      done();
    });

    it(`should add a tailwind config with darkMode set to 'media'`, async (done) => {
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          { style: 'scss', project: 'foo', darkMode: 'media' },
          appTree
        )
        .toPromise();
      expect(tree.readContent('./tailwind.config.js')).toContain(
        `darkMode: 'media'`
      );
      const indexPath = getProjectIndexPath(tree, 'foo');
      expect(tree.readContent(indexPath)).toContain('<body>');
      done();
    });

    it(`should add a tailwind config with all the plugins enabled`, async (done) => {
      const plugins = ['aspect-ratio', 'forms', 'line-clamp', 'typography'];
      const tree = await schematicRunner
        .runSchematicAsync(
          schematic,
          {
            style: 'scss',
            project: 'foo',
            plugins,
          },
          appTree
        )
        .toPromise();
      for (const plugin of plugins) {
        expect(tree.readContent('./tailwind.config.js')).toContain(
          `require('@tailwindcss/${plugin}')`
        );
        expect(tree.readContent('./package.json')).toContain(
          `@tailwindcss/${plugin}`
        );
      }
      done();
    });

    describe('styles', () => {
      test.each([
        'global.css',
        'global.scss',
        'global.less',
        'styles.less',
        'styles.css',
      ])('should patch %s', async (name) => {
        const fileName = `src/${name}`;
        createStyleFile(appTree, fileName);
        useStylesConfig(appTree, [fileName]);
        const tree = await schematicRunner
          .runSchematicAsync(
            schematic,
            {
              style: 'scss',
              project: 'foo',
            },
            appTree
          )
          .toPromise();

        expect(() => checkStylesFile(tree, fileName)).not.toThrow();
      });

      it(`should not patch wrong.css`, async (done) => {
        useStylesConfig(appTree, ['src/wrong.css']);
        const tree = await schematicRunner
          .runSchematicAsync(
            schematic,
            {
              style: 'scss',
              project: 'foo',
            },
            appTree
          )
          .toPromise();

        expect(() => checkStylesFile(tree, './src/wrong.css')).toThrow();

        // should set styles config to node_modules/tailwindcss/tailwind.css
        expect(() => {
          expect(tree.readContent('./angular.json')).toContain(
            'node_modules/tailwindcss/tailwind.css'
          );
        }).not.toThrow();
        done();
      });
    });
  });
});
