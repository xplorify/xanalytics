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
                                <span class="w3-badge w3-right w3-green" v-if="connObj.count">
                                    <span v-if="connObj.connections && connObj.connections.length > 0">
                                        <span v-if="filterFormObj.navigateTo || filterFormObj.groupBy ==='events.url' || filterFormObj.eventType !== null">
                                            {{connObj.connections | connectionsLength}} /
                                        </span>
                                        <span v-if="filterFormObj.groupBy !=='events.url' &&  filterFormObj.eventType === null && !filterFormObj.navigateTo">
                                            {{connObj.connections.length}} /
                                        </span>
                                    </span> {{connObj.count}}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div v-if="!filterFormObj.isDetailed">
                        <div class="w3-panel w3-indigo">
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
                                <span class="w3-badge w3-right w3-green" v-if="connObj.count">
                                    {{connObj.count}}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-bind:class="[connObj.isActive ? 'w3-show' : 'w3-hide']">
                <div v-if="connObj.data && connObj.connections && connObj.connections.length == 0">
                    <div class="w3-row" v-for="data in connObj.data" v-bind:key="data._id">
                        <div v-if="data.connections && data.connections.length >0">
                            <accordion-queries v-bind:connection="data.connections[0]" v-bind:count="data.count" v-bind:filter-form="filterFormObj"></accordion-queries>
                        </div>
                    </div>
                </div>
                <div v-if="!connObj.data || connObj.connections && connObj.connections.length > 0">
                    <div class="w3-row" v-for="connection in connObj.connections" v-bind:key="connection._id">
                        <accordion-queries v-bind:connection="connection" v-bind:filter-form="filterFormObj"></accordion-queries>
                    </div>
                    <div v-if="connObj.connections && connObj.connections.length > 0 && (((filterFormObj.groupBy ==='events.url' || filterFormObj.navigateTo ||  filterFormObj.eventType !== 'null') && getLength(connObj) < connObj.count) ||  (!filterFormObj.navigateTo && filterFormObj.groupBy !=='events.url'  &&  filterFormObj.eventType === null && connObj.connections.length < connObj.count))" class="tablink w3-hover-light-grey w3-padding w3-center">
                        <a v-on:click="loadMore(connObj)">
                            <i class="fa fa-circle-o-notch"></i>
                            <span>Load More</span>
                        </a>
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

    name: 'accordion-grouped',
    props: ["connections", "filterForm"],
    data() {
        return {
            filterFormObj: this.filterForm
        }
    },
    created: function () {
        this.connectionsArray.forEach(function (conn) {
            Vue.set(conn, 'isActive', false);
            Vue.set(conn, 'connections', []);
        });
    },
    methods: {
        toggleGroup: function (group) {
            if (!group.isActive) {
                //reset lastId on accordion group open
                this.filterFormObj.lastIds.forEach(function (obj) {
                    if (obj.key === group._id) {
                        obj.lastId = "";
                    }
                });
                this.filterFormObj.key = group._id;
                this.filterFormObj.lastId = "";
                self = this;
                return queryHelper.searchByKey(group, this.filterFormObj, false)
                    .then(function (result) {
                        self.getLength(group);
                        group.isActive = !group.isActive;
                    });
            } else {
                group.connections = [];
                group.isActive = !group.isActive;
            }
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
        },
        loadMore: function (group) {
            var lastIdFound = this.filterFormObj.lastIds.find(function (lastIdObj) {
                return lastIdObj.key == group._id;
            });
            this.filterFormObj.lastId = lastIdFound.lastId;
            this.filterFormObj.key = lastIdFound.key;
            self = this;
            return queryHelper.searchByKey(group, this.filterFormObj, true)
                .then(function (result) {
                    self.getLength(group);
                });
        }
    },
    computed:{
        connectionsArray: function(){
            this.connections.forEach(function (conn) {
            Vue.set(conn, 'isActive', false);
            Vue.set(conn, 'connections', []);
        });
        return this.connections;
        }
    }
}
</script>
