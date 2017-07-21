<template>
    <div v-bind:id="conn.id" class="w3-margin">
        <div class="container w3-blue" v-on:click="toggle(conn)">
            <span v-if="conn.referrer">
                <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(conn.referrer)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span v-if="conn.userName"> {{conn.userName}}</span> , {{conn.remoteAddress}}, {{conn.countryCode}}, {{conn.referrer}},
            <span>
                <span>{{conn.detectRtc.browser.name}} ({{conn.detectRtc.browser.version}})</span>,
                <span>{{conn.detectRtc.osName}} ({{conn.detectRtc.osVersion}})</span>,
                <span class="w3-btn w3-small w3-green" v-if="conn.detectRtc.hasMicrophone">
                    <i class="fa fa-microphone"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!conn.detectRtc.hasMicrophone">
                    <i class="fa fa-microphone-slash"></i>
                </span>
                <span class="w3-btn w3-small w3-green" v-if="conn.detectRtc.hasWebcam">
                    <i class="fa fa-video-camera"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!conn.detectRtc.hasWebcam">
                    <i class="fa fa-video-camera"></i>
                </span>
                <span class="w3-btn w3-small w3-green" v-if="conn.detectRtc.hasSpeakers">
                    <i class="fa fa-volume-up"></i>
                </span>
                <span class="w3-btn w3-small w3-red" v-if="!conn.detectRtc.hasSpeakers">
                    <i class="fa fa-volume-off"></i>
                </span>
                <span class="w3-badge w3-right w3-green w3-center" v-if="count">
                    {{count}}
                </span>
                <span class="w3-badge w3-right w3-green w3-center" v-if="!count && conn.events.length > 0">
                    {{conn.events.length}}
                </span>
            </span>
        </div>
        <div v-bind:class="[conn.isActive ? 'w3-show' : 'w3-hide']">
            <div v-if="conn.events && conn.events.length > 0">
                <div v-for="connEvent in conn.events" v-bind:key="connEvent.id">
                    <accordion-panel v-bind:conn-event="connEvent"></accordion-panel>
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
    props: ['connection', 'filterForm', 'count'],
    data() {
        return {
            conn: this.connection
        }
    },
    methods: {
        toggle: function (accordion) {
            this.conn.isActive = !accordion.isActive;
        },
        goToUrl: function (url) {
            return window.location.href = url;
        }
    }
}
</script>
