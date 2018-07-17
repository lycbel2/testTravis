<template>
    <div class="content" ref="showWindow">
        {{content}}
    </div>
</template>

<script>
  export default {
    name: 'UpdaterProgressIndicator',
    components: {
      //
    },
    data() {
      return {
        content: 'hello',
      };
    },
    mounted() {
      this.doSome();
      this.$electron.ipcRenderer.send('update-back', 'hello');
      this.$electron.ipcRenderer.on('update-message', (event, text) => {
        this.content += text;
      });
    },
    updated() {
      const elem = this.$refs.showWindow;
      elem.scrollTop = elem.clientHeight;
    },
    methods: {
      doSome() {
        this.content = '';
      },
    },
  };
</script>

<style lang="scss">
.content {
    position: absolute;
    width: 100px;
    height: 100%;
    z-index: 5;
    top: 0px;
    left: 0px;
    overflow: scroll;

}
</style>