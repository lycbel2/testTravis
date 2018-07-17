<template>
  <div id="app" class="application">
    <router-view></router-view>
    <!--<UpdaterProgressIndicator> </UpdaterProgressIndicator>-->
  </div>

</template>

<script>
  // import UpdaterProgressIndicator from './components/UpdaterView/UpdaterProgressIndicator.vue';
  export default {
    // components: {
    //   UpdaterProgressIndicator,
    // },
    name: 'splayer',
  };
</script>

<style lang="scss">
// global scss
@import url('~@/css/style.scss');

</style>
