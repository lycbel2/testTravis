<template>
  <div id="app" class="application">
    {{ hello }}
    <router-view></router-view>
    <UpdaterProgressIndicator> </UpdaterProgressIndicator>
  </div>

</template>

<script>
  import UpdaterProgressIndicator from './components/UpdaterView/UpdaterProgressIndicator.vue';
  import { UpdateHelperForRender } from '../main/update/UpdateHelper.js';
  export default {
    name: 'splayer',
    components: {
      UpdaterProgressIndicator,
    },
    data() {
      return {
        hello: 123,
      };
    },
    mounted() {
      this.doit();
    },
    methods: {
      doit() {
        const updater = new UpdateHelperForRender(this.$electron.ipcRenderer, this);
        console.log(updater.toString());
        // updater.updateMessageHelper.notifier.doTest();
        updater.askStrategy();
        updater.AskDownload = true;
        updater.setStrategy(updater.toString());
      },
      changeHello(input) {
        this.hello = input;
      },
    },
  };
</script>

<style lang="scss">
  // global scss
  @import url('~@/css/style.scss');

</style>
