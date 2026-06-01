export type SelectOption<T extends string | number = string> = {
  label: string;
  value: T;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
