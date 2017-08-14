<template>
    <div v-bind:id="conn.id" style="margin-bottom: 2%">
        <div class="container w3-blue" v-on:click="toggle(conn)">
            <span v-if="conn.referrer">
                <span class="w3-hide-small w3-hide-medium">
                    <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(conn.referrer)">
                        <i class="fa fa-reply"></i>
                    </button>
                </span>
            </span>
            <span class="w3-hide-large">
                <span class="w3-dropdown-hover">
                    <button class="w3-btn w3-blue w3-tiny">
                        <i class="fa fa-caret-square-o-down"></i>
                    </button>
                    <span class="w3-dropdown-content w3-bar-block w3-border w3-card-4" style="min-width:550%">
                        <button class="w3-button w3-tiny w3-blue" v-on:click="goToUrl(conn.referrer)">
                            <i class="fa fa-reply"></i>
                        </button>
                        <span class="w3-btn w3-tiny w3-green" v-if="conn.detectRtc.hasMicrophone">
                            <i class="fa fa-microphone"></i>
                        </span>
                        <span class="w3-btn w3-tiny w3-red" v-if="!conn.detectRtc.hasMicrophone">
                            <i class="fa fa-microphone-slash"></i>
                        </span>
                        <span class="w3-btn w3-tiny w3-green" v-if="conn.detectRtc.hasWebcam">
                            <i class="fa fa-video-camera"></i>
                        </span>
                        <span class="w3-btn w3-tiny w3-red" v-if="!conn.detectRtc.hasWebcam">
                            <i class="fa fa-video-camera"></i>
                        </span>
                        <span class="w3-btn w3-tiny w3-green" v-if="conn.detectRtc.hasSpeakers">
                            <i class="fa fa-volume-up"></i>
                        </span>
                        <span class="w3-btn w3-tiny w3-red" v-if="!conn.detectRtc.hasSpeakers">
                            <i class="fa fa-volume-off"></i>
                        </span>
                        <span class="w3-badge  w3-green w3-center" v-if="count">
                            {{count}}
                        </span>
                        <span class="w3-badge w3-green w3-center" v-if="!count && conn.events.length > 0">
                            {{conn.events.length}}
                        </span>
                    </span>
                </span>
            </span>
            <span v-if="conn.userName"> {{conn.userName}}</span> , {{conn.remoteAddress}}, {{conn.countryCode}}, {{conn.referrer}},
            <span>
                <span>{{conn.detectRtc.browser.name}} ({{conn.detectRtc.browser.version}})</span>,
                <span>{{conn.detectRtc.osName}} ({{conn.detectRtc.osVersion}})</span>,
                <span class="w3-hide-small w3-hide-medium">
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
            </span>
        </div>
        <div v-bind:class="[isActive ? 'w3-show' : 'w3-hide']">
            <div v-if="conn.events && conn.events.length > 0">
                <div v-for="connEvent in conn.events" v-bind:key="connEvent.id">
                    <accordion-queries-panel v-bind:conn-event="connEvent"></accordion-queries-panel>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

Vue.component('accordion-queries-panel', require('./accordion-queries-panel'));
let self;
export default {

    name: 'accordion-queries',
    props: ['connection', 'filterForm', 'count'],
    data() {
        return {
            conn: this.connection,
            isActive: false
        }
    },
    methods: {
        toggle: function () {
            this.isActive = !this.isActive;
        },
        goToUrl: function (url) {
            return window.location.href = url;
        }
    }
}
</script>
