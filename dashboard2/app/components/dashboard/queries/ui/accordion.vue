<template>
    <div v-bind:id="connection.id" class="w3-margin">
        <div class="container w3-blue" v-on:click="toggle(connection)">
            <span v-if="connection.referrer">
                <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(connection.referrer)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span v-if="connection.userName"> {{connection.userName}}</span> , {{connection.remoteAddress}}, {{connection.countryCode}}, {{connection.referrer}},
            <span>
                <span>{{connection.detectRtc.browser.name}} ({{connection.detectRtc.browser.version}})</span>,
                <span>{{connection.detectRtc.osName}} ({{connection.detectRtc.osVersion}})</span>,
                <span class="w3-btn w3-small w3-green" v-if="connection.detectRtc.hasMicrophone">
                    <i class="fa fa-microphone"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!connection.detectRtc.hasMicrophone">
                    <i class="fa fa-microphone-slash"></i>
                </span>
                <span class="w3-btn w3-small w3-green" v-if="connection.detectRtc.hasWebcam">
                    <i class="fa fa-video-camera"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!connection.detectRtc.hasWebcam">
                    <i class="fa fa-video-camera"></i>
                </span>
                <span class="w3-btn w3-small w3-green" v-if="connection.detectRtc.hasSpeakers">
                    <i class="fa fa-volume-up"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!connection.detectRtc.hasSpeakers">
                    <i class="fa fa-volume-off"></i>
                </span>
                <span class="w3-badge w3-right w3-green w3-center" v-if="count">
                    {{count}}
                </span>
                <span class="w3-badge w3-right w3-green w3-center" v-if="!count && connection.events.length > 0">
                    {{connection.events.length}}
                </span>
        </div>
        <div v-bind:class="[connection.isActive ? 'w3-show' : 'w3-hide']">
            <div v-if="connection.events && connection.events.length > 0">
                <div v-for="connectionEvent in connection.events" v-bind:key="connectionEvent.id">
                    <accordion-panel v-bind:connection-event="connectionEvent"></accordion-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { QueryHelper } from './query-helper';
import Vue from 'vue';

Vue.component('accordion-panel', require('./accordion-panel'));
let self;
export default {

    name: 'accordion',
    props:['connection', 'filterForm'],
    data() {
        return { }
    },
    methods: {
        toggle: function (accordion) {
            accordion.isActive = !accordion.isActive;
        },
        goToUrl: function (url) {
           return window.location.href = url;
        }
    }
}
</script>
