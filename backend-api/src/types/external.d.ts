// Types manquants pour les packages ML
declare module 'ml-kmeans' {
  interface KMeansOptions {
    k?: number;
    maxIter?: number;
    tolerance?: number;
    withIterations?: boolean;
    initialization?: string;
  }

  interface KMeansResult {
    clusters: number[];
    centroids: number[][];
    iterations: number;
    converged: boolean;
  }

  function kmeans(data: number[][], options?: KMeansOptions): KMeansResult;
  export = kmeans;
}

declare module 'simple-statistics' {
  export function mean(data: number[]): number;
  export function median(data: number[]): number;
  export function standardDeviation(data: number[]): number;
  export function variance(data: number[]): number;
  export function quantile(data: number[], p: number): number;
  export function correlationCoefficient(x: number[], y: number[]): number;
  export function linearRegression(data: number[][]): { m: number; b: number };
  export function rSquared(data: number[][], func: (x: number) => number): number;
}

declare module '@turf/turf' {
  export interface Point {
    type: 'Point';
    coordinates: number[];
  }

  export interface Feature<T = any> {
    type: 'Feature';
    geometry: T;
    properties: any;
  }

  export interface FeatureCollection<T = any> {
    type: 'FeatureCollection';
    features: Feature<T>[];
  }

  export function point(coordinates: number[], properties?: any): Feature<Point>;
  export function featureCollection<T>(features: Feature<T>[]): FeatureCollection<T>;
  export function center(features: FeatureCollection): Feature<Point>;
  export function distance(from: Feature<Point>, to: Feature<Point>, options?: any): number;
  export function buffer(feature: any, radius: number, options?: any): any;
  export function within(points: FeatureCollection, polygons: FeatureCollection): FeatureCollection;
}