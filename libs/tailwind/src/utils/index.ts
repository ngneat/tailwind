export * from './check-cli-version';
export * from './compare-version';

export * from './get-dependencies';
export * from './get-latest-node-version';
export * from './get-tailwind-imports';

export * from './update-project-root-styles';
export * from './add-config-files';
export * from './update-index-html';
export * from './normalize-options-ng';
export * from './normalize-options-nx';

export * from './is-nx';
export * from './is-in-jest';

/**
 * 11.2 is the minimum version that Tailwind's supported natively by AngularCLI
 */
export const minimumAngularCliVersion = '11.2';
