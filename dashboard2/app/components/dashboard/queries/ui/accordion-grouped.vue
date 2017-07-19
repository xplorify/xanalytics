<template>
    <div v-bind:id="conn._id">
        <div class="container">
            <div class="row">
                <div v-if="filterForm.isDetailed">
                    <div class="w3-panel w3-indigo" v-on:click="toggleGroup(conn)">
                        <p class="w3-padding">
                            <span v-if="conn._id != null">
                                <span v-if="filterForm.groupBy != 'events.url'">
                                    {{conn._id}}
                                </span>
                                <span v-if="filterForm.groupBy === 'events.url'">
                                    <button class="w3-button w3-tiny w3-indigo" v-on:click="goToUrl(conn._id)">
                                        <i class="fa fa-reply"></i>
                                    </button>
                                    {{conn._id}}
                                </span>
                            </span>
                            <span v-if="conn._id == null"> null</span>
                            <span class="w3-badge w3-right w3-green" v-if="totalCount">
                                <span v-if="conn.connections && conn.connections.length > 0">
                                    <span v-if="filterForm.navigateTo || filterForm.groupBy ==='events.url' || filterForm.eventType !== 'null'">
                                        {{conn.connections | eventsLength}} /
                                    </span>
                                    <span v-if="filterForm.groupBy !=='events.url' &&  filterForm.eventType === 'null' && !filterForm.navigateTo">
                                        {{conn.connections.length}} /
                                    </span>
                                </span> {{totalCount}}
                            </span>
                        </p>
                    </div>
                </div>
                <div v-if="!filterForm.isDetailed">
                    <div class="w3-panel w3-indigo">
                        <p class="w3-padding">
                            <span v-if="conn._id != null">
                                <span v-if="filterForm.groupBy != 'events.url'">
                                    {{conn._id}}
                                </span>
                                <span v-if="filterForm.groupBy === 'events.url'">
                                    <button class="w3-button w3-tiny w3-indigo" v-on:click="goToUrl(conn._id)">
                                        <i class="fa fa-reply"></i>
                                    </button>
                                    {{conn._id}}
                                </span>
                            </span>
                            <span v-if="conn._id == null"> null</span>
                            <span class="w3-badge w3-right w3-green" v-if="totalCount">
                                {{totalCount}}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div v-bind:class="[conn.isActive ? 'w3-show' : 'w3-hide']">
            <div v-if="conn.data && conn.connections && conn.connections.length == 0">
                <div class="w3-row" v-for="data in conn.data" v-bind:key="data.id">
                    <accordion v-bind:connection="data.connections[0]" v-bind:count="data.count" v-bind:filter-form="filterForm"></accordion>
                </div>
            </div>
            <div v-if="!conn.data || conn.connections && conn.connections.length > 0">
                <div class="w3-row" v-for="connection in conn.connections" v-bind:key="connection.id">
                    <accordion v-bind:connection="connection" v-bind:filter-form="filterForm"></accordion>
                </div>
                <div v-if="conn.connections && conn.connections.length > 0 && (((filterForm.groupBy ==='events.url' || filterForm.navigateTo ||  filterForm.eventType !== 'null') && getLength(conn) < totalCount) ||  (!filterForm.navigateTo && filterForm.groupBy !=='events.url'  &&  filterForm.eventType === 'null' && conn.connections.length < totalCount))" class="tablink w3-hover-light-grey w3-padding w3-center">
                    <a v-on:click="loadMore(conn)">
                        <i class="fa fa-circle-o-notch"></i>
                        <span>Load More</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { QueryHelper } from './query-helper';
import Vue from 'vue';

Vue.component('accordion', require('./accordion'));
let self;
export default {

    name: 'accordion-grouped',
    props: ["filterForm"],
    data() {
        return {
            queryHelper: QueryHelper,
            eventsLength: 0,
            filterFormObj: this.filterForm
        }
    },
    methods: {
        toggleGroup: function (accordion) {
            this.eventsLength = 0;
            if (!accordion.isActive) {
                //reset lastId on accordion open
                this.filterFormObj.lastIds.forEach(function (obj) {
                    if (obj.key === accordion._id) {
                        obj.lastId = "";
                    }
                });
                this.filterFormObj.key = accordion._id;
                this.filterFormObj.lastId = "";
                return this.queryHelper.searchByKey(accordion, this.filterFormObj, false)
                    .then(function (result) {
                        this.getLength(accordion);
                        accordion.isActive = !accordion.isActive;
                    });
            } else {
                accordion.connections = [];
                accordion.isActive = !accordion.isActive;
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
        loadMore: function(accordion) {
            var lastIdFound = this.filterFormObj.lastIds.find(function (lastIdObj) {
                return lastIdObj.key == accordion._id;
            });
            this.filterFormObj.lastId = lastIdFound.lastId;
            this.filterFormObj.key = lastIdFound.key;
            return this.queryHelper.searchByKey(accordion, this.filterFormObj, true)
                .then(function (result) {
                    this.getLength(accordion);
                });
        }
    }
}
</script>
