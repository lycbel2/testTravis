
/*
   * for the communication between render and main process within
   */
export class RenderNotifier {
  static THIS;
  constructor(updater) {
    this.updater = updater;
    RenderNotifier.THIS = this;
  }

  updateAvailable() {
    this.updater.sendStatusToWindow('AVB');
  }

  updateNotAvailable() {
    this.updater.sendStatusToWindow('notAVB');
  }

  updateDownloaded() {
    this.updater.sendStatusToWindow('downloaded');
  }

  alreadyInupdate() {
    this.updater.sendStatusToWindow('alreadyInUpdate');
  }

  updateDownloadStatus(status) {
    this.updater.sendStatusToWindow(`updateStatus#${status}`);
  }

  sendUpdateStrategy(stragety) {
    this.updater.sendStatusToWindow(`updateStrategy#${stragety}`);
  }
}

export class updaterNotifier {
  constructor(rendererWindowObject) {
    this.render = rendererWindowObject;
  }

  askStrategy() {
    this.render.sendToMain();
  }

  cancelUpdate() {
    this.render.sendStatusToWindow();
  }

  manuallyUpdate() {
    this.render.sendStatusToWindow();
  }

  setStrategy() {
    this.render.sendStatusToWindow();
  }
}
