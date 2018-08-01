<template>
    <div class="updateContainer" ref="showWindow" :style="[containerProp, hideOrNot]">
        <div class="backGround" ref="backGround" >
        </div>
        <div class="breathe-div" ref="breath" :style="linkProp"></div>
        <div class="overInner" ref="overInner" >
            {{content}}
            <div class="linksInUpdater" v-for="(item) in buttons">
                <a href='#' v-on:click=item.callBack.call(item.THIS)> {{item.text}} </a>
            </div>
        </div>
    </div>
</template>

<script>
  import GetHelper from '../../../main/update/RendererHelper.js';
  export default {
    name: 'UpdaterNotification',
    components: {
      //
    },
    data() {
      return {
        content: '',
        totalShow: false,
        updateShow: false,
        baseHeight: '22px',
        buttons: [],
        position: { right: '50%', top: '50px' },
        breathType: null,
        visibility: 'hidden',
      };
    },
    beforeMount() {
      this.helper = new GetHelper(this);
    },
    mounted() {
    },
    updated() {
    },
    methods: {
      hide() {
        this.visibility = 'hidden';
      },
      show() {
        this.$refs.showWindow.className = 'updateContainer';
        this.visibility = 'visible';
      },
      registerCallBackButton(buttons) {
        this.buttons = buttons;
      },
      setMessage(message) {
        this.content = message.toString();
      },
      startDisappear(time = 50000) {
        setTimeout(() => {
          this.$refs.showWindow.className = 'updateContainerDisappear';
        }, time);
      },
      setPosition(position) {
        this.position = position;
      },
      setBreathType(breath) {
        this.breathType = breath;
      },
      topCenter() {
        this.position = { left: '50%', transform: 'translateX(-50%)', top: '20px' };
      },
      onLeftForWin() {
        this.position = { left: '10%', top: '20px' };
      },
    },
    computed: {
      linkProp() {
        return ({ 'webkit-animation-name': this.breathType });
      },
      containerProp() {
        return (this.position);
      },
      hideOrNot() {
        return ({ visibility: this.visibility });
      },
    },
  };
</script>

<style lang="scss">
    .updateContainer{
        position: fixed;
        margin-right: 10px;
        height: 22px;
        z-index: 1;
        display: -webkit-flex;
        -webkit-flex-direction: row;
        display: flex;
        flex-direction: row;
        opacity: 1;
        transition: opacity 4s linear;
        .backGround {
            z-index: 1;
            width: inherit;
            position: absolute;
            top:0px; right:0px; bottom:0px; left:0px;
            height: inherit;
            z-index: 1;
            border-radius: 16px;
            background-color: rgba(64,64,64,.89);
            -webkit-filter: blur(0.5px);
        }
        .overInner{
            position: relative;
            height: inherit;
            z-index: 2;
            font-size: 10px;
            // font-family: PingFang-SC-Medium;
            color: #FFFFFF;
            font-weight:lighter;
            line-height: 22px;
            margin-left: 25px;
            margin-right: 10px;
            display: -webkit-flex;
            -webkit-flex-direction: row;
            letter-spacing: 0.5px;
            .linksInUpdater{
                position: relative;
                display: inline-block;
                margin-left:10px;
                a:active, a:visited, a:link{
                    text-decoration:none;
                    color: rgba(255,255,255,0.3);
                }
                a:hover {
                    text-decoration:none;
                    color: rgba(255,255,255,1);
                }
            }
        }
    }
    .updateContainerDisappear{
        opacity: 1;
        filter: alpha(opacity=100);
        display: none;
    }
    .breathe-div {
        left:10px;
        // position: relative;
        transform: translateY(50%);
        z-index: 2;
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        height: 5px;
        width: 5px;
        background-color: #bbb;
        border-radius: 50%;
        overflow: hidden;
        -webkit-animation-timing-function: ease-in-out;
        -webkit-animation-duration: 1500ms;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-direction: alternate;
    }
    @-webkit-keyframes breatheAlert {
        0% {
            opacity: .4;
            box-shadow: 0 1px 2px rgba(183,255,111,0.5), 0 1px 1px rgba(183,255,111,0.3) inset;;
        }
        100% {
            opacity: 1;
            box-shadow: 0 1px 30px red, 0 1px 20px red inset;
        }
    }
    @-webkit-keyframes breatheSuccess {
        0% {
            opacity: .4;
            box-shadow: 0 1px 2px rgba(183,255,111,0.5), 0 1px 1px rgba(183,255,111,0.3) inset;;
        }
        100% {
            opacity: 1;
            box-shadow: 0 1px 30px greenyellow, 0 1px 20px green inset;
        }
    }


</style>