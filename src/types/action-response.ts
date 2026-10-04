export type ActionResponse<T = null> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };
