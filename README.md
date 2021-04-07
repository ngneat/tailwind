# Angular Tailwind CSS Schematics

This schematic will add [Tailwind CSS](https://tailwindcss.com/) to your
[Angular](https://angular.io) application.

![Angular Tailwind CSS Schematics][demo]

[demo]: https://github.com/ngneat/tailwind/raw/master/assets/ngneat-tailwind.gif

## Versions

| `@ngneat/tailwind` | AngularCLI           |
| :----------------- | :------------------- |
| v7.x.x             | >= 11.2.x            |
| v6.x.x             | >= v11.1.x, < 11.2.x |
| v5.2.5             | < v11.1.x            |

### v7.x.x

In v7, we leverage the [built-in TailwindCSS support from AngularCLI](https://github.com/angular/angular-cli/commit/73b409881f71a8235769a345356dcde3c568d0c3) if you use AngularCLI >= 11.2. When you invoke the schematics, and you have AngularCLI <11.2 installed, you'll see the following message:

```
Detected AngularCLI version is 11.0.7 which does not support TailwindCSS natively.
Please run "ng add @ngneat/tailwind@6" for Custom Webpack support.
```

### v6.x.x

The main difference is Angular CLI v11.1+ uses `PostCSS 8` already, so we remove that from our dependencies list. To use these schematics at specific version, please use this syntax: `ng add @ngneat/tailwind@5.2.5` or `npm i -D @ngneat/tailwind@5.2.5`

## Usage

```
ng add @ngneat/tailwind
```

## Usage with Nx

In Nx, you can either use `AngularCLI` or `NxCLI`. If you set up your Nx Workspace to use `AngularCLI`, the usage is the same as above. If you set up your Nx Workspace with `NxCLI`, follow the steps:

Install `@ngneat/tailwind` first:

```
npm i -D @ngneat/tailwind tailwindcss postcss autoprefixer
yarn add -D @ngneat/tailwind tailwindcss postcss autoprefixer
```

then execute the schematics:

```
nx generate @ngneat/tailwind:nx-setup
```

## Manual steps

### v7.x.x

In v7, we do not use a **Custom Webpack** anymore. If you use **Custom Webpack**, please follow the below guide and use `@ngneat/tailwind@6`

### v6.x.x

If your projects are already using a custom **Webpack** builder with a
custom `webpack.config`, follow these steps to add **TailwindCSS** to
your project

- `npm i -D @ngneat/tailwind tailwindcss` (or `yarn add -D @ngneat/tailwind tailwindcss`)
- Import `addTailwindPlugin` from `@ngneat/tailwind` in your
  `webpack.config`
- Import your **TailwindCSS** config in your `webpack.config`
- Before you return or modify the original Webpack config, call
  `addTailwindPlugin` with the following parameters:
  - `webpackConfig`: the Webpack config
  - `tailwindConfig`: the TailwindCSS config that you import
  - `patchComponentsStyles?`: this flag will enable using TailwindCSS
    directives in components' stylesheets. Default to `false` because
    turning it on might impact your build time

```js
// example
const { addTailwindPlugin } = require('@ngneat/tailwind');
const tailwindConfig = require('relative/path/to/tailwind.config');

module.exports = (config) => {
  addTailwindPlugin({
    webpackConfig: config,
    tailwindConfig,
    patchComponentsStyles: true,
  });
  return config;
};
```

## Angular Material

If you plan to use `@ngneat/tailwind` with `@angular/material`, please make sure that you setup `@angular/material` **before** `@ngneat/tailwind` because `@angular/material:ng-add` schematics will error out if it detects a custom Webpack in your `angular.json`.

## Purge

`@ngneat/tailwind` uses built-in `purge` functionality by `tailwindcss` (under the hood, it is [postcss-purgecss](https://github.com/FullHuman/purgecss/tree/master/packages/postcss-purgecss)). By default, `@ngneat/tailwind` sets the `content` to any **HTML** and any **TS** files in the project.

This behavior can be modified as the consumers see fit.

## Tailwind JIT (v7.x.x only)

In v7, `@ngneat/tailwind` provides an option to enable JIT mode for TailwindCSS. This is a new compilation mode that improves the compilation time as it does not compile **ALL** of TailwindCSS anymore but only compiles what you use in your application. This mode is still in preview as of `tailwindcss@2.1.1`

## CSS Preprocessors

If you're using CSS Preprocessors (SASS/SCSS, LESS, Stylus) in your application, please check out [TailwindCSS's Using with Preprocessors guide](https://tailwindcss.com/docs/using-with-preprocessors#using-sass-less-or-stylus)

## Contributing

- Fork this repo and clone the fork on your machine.
- Run `npm install` to install all the dependencies
- Start working on changes

### Structure

```
_apps
 |__tailwind-e2e (e2e tests)
_libs
 |__tailwind
    |__src
       |__schematics
          |__ng-add (AngularCLI schematics)
          |__nx-setup (NxCLI schematics)
          |__files (files template to be generated)
          |__specs (unit tests)
          |__schema.d.ts (interface)
       |__constants (constants used in the project)
       |__utils (utilities functions)
       |__collection.json (schematics configuration)
       |__package.json (package.json of @ngneat/tailwind which will be published to npm)
```

### Commit

- Run `git add .` to stage your changes
- Run `npm run commit` to start Conventional Commit flow

### Commit Hooks

pre-commit will execute `npm run lint` and `pretty-quick` to lint and
reformat.pre-commit does not run Unit Tests because Unit Tests will be
ran in Github Actions. Feel free to run the Unit Tests with `npm run test` to test your changes

### E2E Tests

Please run `npm run e2e` to run E2E tests before pushing

### Updating README

`README` is in two places at the moment: root and
`libs/tailwind/README.md`. The one in root is the one displayed on
Github while the one in `libs/tailwind` is being used on `npm`. When you
make changes to `README`, make sure to update both.

> A script can be created to automating this.

### PR

When everything passes and looks good, make a PR. Thanks for your
contribution.

## Contributors ✨

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<table>
  <tr>
    <td align="center"><a href="https://nartc.me/"><img src="https://avatars1.githubusercontent.com/u/25516557?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Chau Tran</b></sub></a><br /><a href="#question-nartc" title="Answering Questions">💬</a> <a href="https://github.com/ngneat/tailwind/commits?author=nartc" title="Code">💻</a> <a href="https://github.com/ngneat/tailwind/commits?author=nartc" title="Documentation">📖</a> <a href="#ideas-nartc" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/ngneat/tailwind/pulls?q=is%3Apr+reviewed-by%3Anartc" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.netbasal.com/"><img src="https://avatars1.githubusercontent.com/u/6745730?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Netanel Basal</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=NetanelBasal" title="Code">💻</a> <a href="#ideas-NetanelBasal" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.santoshyadav.dev/"><img src="https://avatars3.githubusercontent.com/u/11923975?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Santosh Yadav</b></sub></a><br /><a href="#ideas-santoshyadavdev" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-santoshyadavdev" title="Mentoring">🧑‍🏫</a></td>
    <td align="center"><a href="https://bilalkhoukhi.com/"><img src="https://avatars1.githubusercontent.com/u/4480581?v=4?s=75" width="75px;" alt=""/><br /><sub><b>BK</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=Bilal-io" title="Code">💻</a> <a href="#ideas-Bilal-io" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/beeman"><img src="https://avatars3.githubusercontent.com/u/36491?v=4?s=75" width="75px;" alt=""/><br /><sub><b>beeman</b></sub></a><br /><a href="#ideas-beeman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#mentoring-beeman" title="Mentoring">🧑‍🏫</a> <a href="https://github.com/ngneat/tailwind/commits?author=beeman" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/vltansky"><img src="https://avatars0.githubusercontent.com/u/5851280?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Vlad Tansky</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=vltansky" title="Code">💻</a></td>
    <td align="center"><a href="https://abhinav.xyz/"><img src="https://avatars2.githubusercontent.com/u/10206236?v=4?s=75" width="75px;" alt=""/><br /><sub><b>Abhinav Dinesh C</b></sub></a><br /><a href="https://github.com/ngneat/tailwind/commits?author=abhinavdc" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!
