<template>
  <div id="app" class="application">
    <router-view></router-view>
    <UpdaterProgressIndicator> </UpdaterProgressIndicator>
      <UpdaterNotification></UpdaterNotification>
  </div>

</template>

<script>
  import UpdaterProgressIndicator from './components/UpdaterView/UpdaterProgressIndicator.vue';
  import UpdaterNotification from './components/UpdaterView/UpdaterNotification.vue';
  export default {
    name: 'splayer',
    components: {
      UpdaterProgressIndicator,
      UpdaterNotification,
    },
  };
</script>

<style lang="scss">
  // global scss
  @import url('~@/css/style.scss');

</style>
