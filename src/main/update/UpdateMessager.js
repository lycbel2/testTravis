
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
    this.updater.sendStatusToWindow('update-AVB');
  }

  updateNotAvailable() {
    this.updater.sendStatusToWindow('update-not-AVB');
  }

  updateDownloaded() {
    this.updater.sendStatusToWindow('update-downloaded');
  }

  alreadyInupdate() {
    this.updater.sendStatusToWindow('update-already-in');
  }

  updateDownloadStatus(status) {
    this.updater.sendStatusToWindow(`update-status#${status}`);
  }

  sendUpdateStrategy(stragety) {
    this.updater.sendStatusToWindow(`update-strategy#${stragety}`);
  }
}

export class updaterNotifier {

}
