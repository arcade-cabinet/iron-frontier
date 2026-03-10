export interface LoadingStage {
  key: string;
  label: string;
  done: boolean;
}

export interface LoadingScreenProps {
  /** Ordered list of loading stages with completion flags. */
  stages: LoadingStage[];
  /** When true, all stages are done and the screen will fade out and unmount. */
  allReady: boolean;
}
