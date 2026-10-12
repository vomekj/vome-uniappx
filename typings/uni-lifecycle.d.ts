/**
 * uni-app x 编译器注入的页面/应用生命周期（全局可用，勿从 @dcloudio/uni-app import）。
 */
declare function onLaunch(
  cb: (options?: App.LaunchShowOption) => void | Promise<void>,
): void
declare function onShow(
  cb?: (options?: App.LaunchShowOption) => void | Promise<void>,
): void
declare function onHide(cb?: () => void | Promise<void>): void
declare function onLoad(
  cb: (query?: Record<string, string | undefined>) => void | Promise<void>,
): void
declare function onReady(cb: () => void | Promise<void>): void
declare function onUnload(cb: () => void | Promise<void>): void
declare function onPullDownRefresh(cb: () => void | Promise<void>): void
declare function onReachBottom(cb: () => void | Promise<void>): void
