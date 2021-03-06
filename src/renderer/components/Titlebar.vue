<template>
  <div :class="{ 'darwin-titlebar': isDarwin, titlebar: !isDarwin }"
    v-show="showTitlebar">
    <div class="win-icons" v-if="!isDarwin">
      <div id="minimize" class="title-button"
        @click="handleMinimize">
        <img src="~@/assets/windows-titlebar-icons.png" />
      </div>
      <div id="maximize" class="title-button"
        @click="handleMaximize"
        v-show="middleButtonStatus === 'maximize'">
        <img :class="{ disabled: currentView === 'LandingView' }" src="~@/assets/windows-titlebar-icons.png" />
      </div>
      <div id="restore" class="title-button"
        @click="handleRestore"
        v-show="middleButtonStatus === 'restore'">
        <img src="~@/assets/windows-titlebar-icons.png" />
      </div>
      <div id="exit-fullscreen" class="title-button"
        @click="handleFullscreenExit"
        v-show="middleButtonStatus === 'exit-fullscreen'">
        <img src="~@/assets/windows-titlebar-icons.png" />
      </div>
      <div id="close" class="title-button"
        @click="handleClose">
        <img src="~@/assets/windows-titlebar-icons.png" />
      </div>
    </div>
    <div class="mac-icons" v-if="isDarwin">
      <div id="close" class="title-button"
        @click="handleClose">
      </div>
      <div id="minimize" class="title-button"
        @click="handleMinimize"
        :class="{ disabled: middleButtonStatus === 'exit-fullscreen' }">
      </div>
      <div id="maximize" class="title-button"
        @click="handleMacMaximize"
        v-show="middleButtonStatus !== 'exit-fullscreen'"
        :class="{ disabled: currentView === 'LandingView' }">
      </div>
      <div id="restore" class="title-button"
        @click="handleFullscreenExit"
        v-show="middleButtonStatus === 'exit-fullscreen'">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'titlebar',
  data() {
    return {
      showTitlebar: true,
      middleButtonStatus: 'maximize',
      windowInfo: {
        screenWidth: null,
        windowWidth: null,
        windowPosition: null,
      },
      maximize: false,
      isDarwin: process.platform === 'darwin',
      titlebarDelay: 0,
    };
  },
  props: {
    currentView: String,
  },
  methods: {
    // Methods to handle window behavior
    handleMinimize() {
      this.$electron.remote.getCurrentWindow().minimize();
    },
    handleMaximize() {
      this.$electron.remote.getCurrentWindow().maximize();
    },
    handleClose(e) {
      console.log(e);
      this.$electron.remote.getCurrentWindow().close();
    },
    handleRestore() {
      this.$electron.remote.getCurrentWindow().unmaximize();
    },
    handleFullscreenExit() {
      this.$electron.remote.getCurrentWindow().setFullScreen(false);
    },
    // OS-specific methods
    handleMacMaximize() {
      if (this.currentView !== 'LandingView') {
        this.$electron.remote.getCurrentWindow().setFullScreen(true);
      }
    },
    handleResize() {
      this.setWindowInfo();
      this.statusChange();
      this.titlebarWidth = this.winWidth;
      this.originalSize = this.winSize;
    },
    statusChange() {
      if (this.$store.getters.fullscreen) {
        this.middleButtonStatus = 'exit-fullscreen';
      } else if (this.maximize) {
        this.middleButtonStatus = 'restore';
      } else {
        this.middleButtonStatus = 'maximize';
      }
    },
    setWindowInfo() {
      [this.windowInfo.screenWidth, this.windowInfo.windowWidth] = [
        this.$electron.screen.getPrimaryDisplay().workAreaSize.width,
        this.winWidth,
      ];
      this.windowInfo.windowPosition = this.winPos;
      this.updateMaximize(this.windowInfo);
    },
    updateMaximize(val) {
      const sizeOffset = Math.abs(val.screenWidth - val.windowWidth);
      const positionOffset = Math.sqrt((this.windowInfo.windowPosition[0] ** 2) +
        (this.windowInfo.windowPosition[1] ** 2));
      if (sizeOffset <= 5 && positionOffset <= 5) {
        this.maximize = true;
      } else {
        this.maximize = false;
      }
    },
    appearTitlebar() {
      if (this.titlebarDelay !== 0) {
        clearTimeout(this.titlebarDelay);
      }
      this.showTitlebar = true;
    },
    hideTitlebar() {
      this.showTitlebar = false;
    },
  },
  beforeMount() {
    this.setWindowInfo();
    this.statusChange();
  },
  mounted() {
    this.$electron.ipcRenderer.on('main-resize', this.handleResize);
    this.$electron.ipcRenderer.on('main-move', this.setWindowInfo);
    this.$bus.$on('titlebar-appear-delay', () => {
      this.appearTitlebar();
      if (this.showTitlebar !== 0) {
        clearTimeout(this.titlebarDelay);
        this.titlebarDelay = setTimeout(this.hideTitlebar, 3000);
      } else {
        this.titlebarDelay = setTimeout(this.hideTitlebar, 3000);
      }
    });
    this.$bus.$on('titlebar-appear', this.appearTitlebar);
    this.$bus.$on('titlebar-hide', this.hideTitlebar);
  },
  computed: {
    show() {
      if (this.showTitlebar === false) {
        return {
          Maximize: false,
          Restore: false,
          FullscreenExit: false,
        };
      }
      return {
        Maximize: this.middleButtonStatus === 'maximize',
        Restore: this.middleButtonStatus === 'restore',
        FullscreenExit: this.middleButtonStatus === 'exit-fullscreen',
      };
    },
    winSize() {
      return this.$store.getters.winSize;
    },
    winWidth() {
      return this.$store.getters.winWidth;
    },
    winPos() {
      return this.$store.getters.winPos;
    },
  },
};
</script>

<style lang="scss">
.titlebar {
  position: absolute;
  top: 0;
  border-radius: 10px;
  width: 100%;
  -webkit-app-region: drag;
  height: 28px;
  z-index: 6;
  .win-icons {
    display: flex;
    flex-wrap: nowrap;
    position: absolute;
    right: 5px;
    .title-button {
      margin: 0px 2px 2px 0px;
      width: 45px;
      height: 28px;
      -webkit-app-region: no-drag;
      background-color: rgba(255,255,255,0);
      transition: background-color 200ms;
    }
    .title-button:hover {
      background-color: rgba(221, 221, 221, 0.2);
    }
    .title-button:active {
      background-color: rgba(221, 221, 221, 0.5);
    }
  }
  img {
    object-fit: none;
    width: 45px;
    height: 28px;
    -webkit-user-drag: none;
    -webkit-app-region: no-drag;
  }
  #minimize img {
    object-position: 0 0
  }
  #maximize img {
    object-position: 0 -28px;
    &.disabled {
      object-position: 0 -140px;
      -webkit-app-region: drag;
    }
  }
  #restore img {
    object-position: 0 -56px;
  }
  #exit-fullscreen img {
    object-position: 0 -84px;
  }
  #close img {
    object-position: 0 -112px;
  }
}
.darwin-titlebar {
  position: absolute;
  z-index: 6;
  box-sizing: content-box;
  top: 6px;
  left: 10px;
  height: 20px;
  .mac-icons {
    display: flex;
    flex-wrap: nowrap;
  }
  .title-button {
    width: 12px;
    height: 12px;
    margin-right: 8px;
    background-image: url('../assets/mac-titlebar-icons.png');
    background-repeat: no-repeat;
    -webkit-app-region: no-drag;
    opacity: 0.5;
    border-radius: 100%;
  }
  .mac-icons {
    &:hover {
      #close {
        background-position-y: 0;
        opacity: 1;
        &:active {
          background-position-y: -12px;
        }
      }
      #minimize {
        background-position-y: -24px;
        opacity: 1;
        &.disabled {
          background-position-y: -108px;
          opacity: 0.25;
        }
        &:active {
          background-position-y: -36px;
        }
      }
      #maximize {
        background-position-y: -48px;
        opacity: 1;
        &.disabled {
          background-position-y: -108px;
          opacity: 0.25;
        }
        &:active {
          background-position-y: -60px;
        }
      }
      #restore {
        background-position-y: -72px;
        opacity: 1;
        &:active {
          background-position-y: -84px;
        }
      }
    }
  }
  .title-button {
    background-position-y: -96px;
  }
  #minimize {
    &.disabled {
      background-position-y: -108px;
      pointer-events: none;
      opacity: 0.25;
    }
  }
  #maximize {
    &.disabled {
      background-position-y: -108px;
      pointer-events: none;
      opacity: 0.25;
    }
  }
  @media screen and (-webkit-min-device-pixel-ratio: 1) and (-webkit-max-device-pixel-ratio: 2) {
    .title-button {
      background-size: 36px 240px;
      background-position-x: 0;
    }
  }
  @media screen and (-webkit-min-device-pixel-ratio: 2) {
    .title-button {
      background-size: 18px 120px;
      background-position-x: -6px;
    }
  }
}
</style>
