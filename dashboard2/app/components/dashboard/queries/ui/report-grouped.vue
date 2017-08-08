<template>
    <div>
        <div class="row" v-for="connObj in connectionsArray" :key="connObj._id">
            <div class="container">
                <div class="row">
                    <div v-if="filterFormObj.isDetailed">
                        <div class="w3-panel w3-indigo" v-on:click="toggleGroup(connObj)">
                            <p class="w3-padding">
                                <span v-if="connObj._id != null">
                                    <span v-if="filterFormObj.groupBy != 'events.url'">
                                        {{connObj._id}}
                                    </span>
                                    <span v-if="filterFormObj.groupBy === 'events.url'">
                                        <button class="w3-button w3-tiny w3-indigo" v-on:click="goToUrl(connObj._id)">
                                            <i class="fa fa-reply"></i>
                                        </button>
                                        {{connObj._id}}
                                    </span>
                                </span>
                                <span v-if="connObj._id == null"> null</span>
                                <span class="w3-badge w3-right w3-green">
                                    <span v-if="connObj.connections && connObj.connections.length > 0">
                                        <span v-if="filterFormObj.navigateTo || filterFormObj.groupBy ==='events.url' || filterFormObj.eventType !== null">
                                            {{connObj.connections | connectionsLength}} /
                                        </span>
                                        <span v-if="filterFormObj.groupBy !=='events.url' &&  filterFormObj.eventType === null && !filterFormObj.navigateTo">
                                            {{connObj.connections.length}}
                                        </span>
                                    </span>
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-bind:class="[connObj.isActive ? 'w3-show' : 'w3-hide']">
                <div v-if="connObj.connections && connObj.connections.length > 0">
                    <div class="w3-row" v-for="connection in connObj.connections" v-bind:key="connection._id">
                        <accordion-queries v-bind:connection="connection" v-bind:filter-form="filterFormObj"></accordion-queries>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { queryHelper } from './query-helper';
import Vue from 'vue';

Vue.component('accordion-queries', require('./accordion-queries'));
Vue.filter('connectionsLength', function (connections) {
    var events = 0;
    connections.forEach(function (connection) {
        events += connection.events.length;
    });
    return events;
})
let self;
export default {

    name: 'report-grouped',
    props: ["connections", "filterForm"],
    computed: {
        connectionsArray: function () {
            this.connections.forEach(function (conn) {
                Vue.set(conn, 'isActive', false);
            });
            return this.connections;
        }
    },
    data() {
        return {
            filterFormObj: this.filterForm,
        }
    },
    methods: {
        toggleGroup: function (group) {
                group.isActive = !group.isActive;
        },
        goToUrl: function (url) {
            return window.location.href = url;
        },
        getLength: function (conn) {
            var events = 0;
            conn.connections.forEach(function (connection) {
                events += connection.events.length;
            });
            return events;
        }
    }
}
</script>
