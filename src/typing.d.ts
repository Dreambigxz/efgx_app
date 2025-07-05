declare module 'pulltorefreshjs' {
  interface PullToRefreshOptions {
    mainElement?: string;
    onRefresh: () => Promise<any> | any;
  }

  const PullToRefresh: {
    init: (options: PullToRefreshOptions) => void;
    destroyAll: () => void;
  };

  export default PullToRefresh;
}
