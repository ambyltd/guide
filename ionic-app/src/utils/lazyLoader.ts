/**
 * Lazy loader simplifié pour les composants
 */
export default class LazyLoader {
  static component = () => null;
  static register = () => {};
  static getLoadedComponents = () => [];
  static getPendingComponents = () => [];
}
