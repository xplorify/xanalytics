<template>
    <div class="w3-row w3-margin">
        <span>{{panelObj.data.userName}}</span>,
        <span>{{panelObj.data.countryCode}}</span>,
        <span>{{panelObj.data.remoteAddress}}</span>,
        <span>{{panelObj.data.detectRtc.browser.name}} ({{panelObj.data.detectRtc.browser.version}})</span>,
        <span>{{panelObj.data.detectRtc.osName}} ({{panelObj.data.detectRtc.osVersion}})</span>
    
        <span class="pull-right">
            <button class="w3-btn w3-small w3-green" v-if="panelObj.data.detectRtc.hasMicrophone">
                <i class="fa fa-microphone"></i>
            </button>
            <button class="w3-btn w3-small w3-red" v-if="!panelObj.data.detectRtc.hasMicrophone">
                <i class="fa fa-microphone-slash"></i>
            </button>
            <button class="w3-btn w3-small w3-green" if.bind="panelObj.data.detectRtc.hasWebcam">
                <i class="fa fa-video-camera"></i>
            </button>
            <button class="w3-btn w3-small w3-red" v-if="!panelObj.data.detectRtc.hasWebcam">
                <i class="fa fa-video-camera"></i>
            </button>
            <button class="w3-btn w3-small w3-green" v-if="panelObj.data.detectRtc.hasSpeakers">
                <i class="fa fa-volume-up"></i>
            </button>
            <button class="w3-btn w3-small w3-red" v-if="!panelObj.data.detectRtc.hasSpeakers">
                <i class="fa fa-volume-off"></i>
            </button>
        </span>
    </div>
</template>

<script>
export default {
    name: 'accordion-panel',
    props: ['panel'],
    data(){
        return {
            panelObj: this.panel
        }
    }
}
</script>
