import * as path from 'path';

export const rootDir = path.resolve(__dirname, '..', '..', '..');
export const envFile = path.resolve(rootDir, '.env');
export const clientDir = path.resolve(rootDir, 'packages', 'client', 'build');
export const publicDir = path.resolve(__dirname, "..", 'public');
export const clientApp = path.resolve(clientDir, 'index.html');