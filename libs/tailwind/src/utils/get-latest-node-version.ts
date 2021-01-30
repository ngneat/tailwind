import { get } from 'http';

export interface NodePackage {
  name: string;
  version: string;
}

/**
 * Attempt to retrieve the metadata of the package name.
 * If no metadata found, will use "latest" as version for the package.
 *
 * @return {Promise<NodePackage>}
 * @param packageName
 */
export function getLatestNodeVersion(
  packageName: string
): Promise<NodePackage> {
  const DEFAULT_VERSION = 'latest';

  return new Promise((resolve) => {
    return get(`http://registry.npmjs.org/${packageName}`, (res) => {
      let rawData = '';
      res.on('data', (chunk) => (rawData += chunk));
      res.on('end', () => {
        try {
          if (packageName.includes('@angular-builders/custom-webpack')) {
            resolve(buildPackage(packageName, '10.0.1'));
          } else {
            const response = JSON.parse(rawData);
            const version = (response && response['dist-tags']) || {};
            resolve(buildPackage(packageName, version.latest));
          }
        } catch (e) {
          resolve(buildPackage(packageName));
        }
      });
    }).on('error', () => resolve(buildPackage(packageName)));
  });

  function buildPackage(
    name: string,
    version: string = DEFAULT_VERSION
  ): NodePackage {
    return { name, version };
  }
}
