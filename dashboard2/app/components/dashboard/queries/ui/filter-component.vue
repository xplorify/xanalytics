<template>
    <div class="w3-row">
        <div class="w3-card-4">
            <div class="w3-container w3-blue">
                <h4>Filter</h4>
            </div>
            <form class="w3-container" v-if="filterFormObj">
                <div style="width: 100%" class="w3-third tablink w3-bottombar">
                    <h4>
                        <i class="fa fa-tag w3-text-blue"></i>
                        <span class="w3-text-blue">Connection</span>
                    </h4>
                </div>
                <div class="w3-row" style="margin-top:1%; position:relative">
                    <label class="w3-text-blue" style="margin-top: 5%">From</label>
                    <date-picker v-model="filterFormObj.from" v-bind:config="{format: 'YYYY-MM-DD'}"></date-picker>
                </div>
                <div class="w3-row" style="position:relative">
                    <label class="w3-text-blue">To</label>
                    <date-picker v-model="filterFormObj.to" v-bind:config="{format: 'YYYY-MM-DD'}"></date-picker>
                </div>
                <p>
                    <p>
                        <label class="w3-text-blue">
                            <b>Username</b>
                        </label>
                        <input class="w3-input w3-border" type="text" v-bind:value="filterFormObj.username">
                    </p>
                    <p>
                        <label class="w3-text-blue">
                            <b>Ip Address</b>
                        </label>
                        <input class="w3-input w3-border" type="text" v-bind:value="filterFormObj.ipAddress">
                    </p>
                    <p>
                        <label class="w3-text-blue">
                            <b>Country Code</b>
                        </label>
                        <input class="w3-input w3-border" type="text" v-bind:value="filterFormObj.countryCode">
                    </p>
                    <p>
                        <label class="w3-text-blue">
                            <b>Referrer</b>
                        </label>
                        <input class="w3-input w3-border" type="text" v-bind:value="filterFormObj.referrer">
                    </p>
                    <p>
                        <select v-model="filterFormObj.browser" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Choose Browser-</option>
                            <option v-for="browserName in browsers" v-bind:key="browserName">{{browserName}}</option>
                        </select>
                    </p>
                    <p>
                        <select v-model="filterFormObj.operatingSystem" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Choose Operating System-</option>
                            <option v-for="osName in osNames" v-bind:key="osName">{{osName}}</option>
                        </select>
                    </p>
                    <p>
                        <select v-model="filterFormObj.application" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Choose Application-</option>
                            <option v-for="app in applications" v-bind:key="app.code">{{app.code}}</option>
                        </select>
                    </p>
                    <div style="width: 100%" class="w3-third tablink w3-bottombar">
                        <h4>
                            <i class="fa fa-tags w3-text-blue"></i>
                            <span class="w3-text-blue">Event</span>
                        </h4>
                    </div>
                    <p>
                        <label class="w3-text-blue" style="margin-top: 5%">
                            <b>Navigate To</b>
                        </label>
                        <input class="w3-input w3-border" type="text" v-bind:value="filterFormObj.navigateTo">
                    </p>
                    <p>
                        <select v-model="filterFormObj.eventType" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Choose Event Type-</option>
                            <option v-for="eventLog in eventLogs" v-bind:key="eventLog">{{eventLog}}</option>
                        </select>
                    </p>
                    <div style="width: 100%" class="w3-third tablink w3-bottombar">
                        <h4>
                            <i class="fa fa-plus w3-text-blue"></i>
                            <span class="w3-text-blue">Aggregation</span>
                        </h4>
                    </div>
                    <p>
                        <input style="margin-top: 5%" class="w3-check" type="checkbox" v-model="filterFormObj.isDetailed">
                        <label class="w3-text-blue">Detailed search</label>
                    </p>
                    <p>
                        <select v-model="filterFormObj.groupBy" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Choose Grouping-</option>
                            <option v-for="grouping in groupings" v-bind:key="grouping">{{grouping}}</option>
                        </select>
                    </p>
                    <p v-if="filterFormObj.isDetailed">
                        <select v-model="pageSize" class="w3-text-blue w3-white w3-btn w3-border w3-border-blue w3-block">
                            <option v-bind:value="null">-Select Page Size-</option>
                            <option v-for="size in pageSizeChoices" v-bind:key="size">{{size}}</option>
                        </select>
                    </p>
                </p>
            </form>
            <button class="w3-btn w3-block w3-blue" v-on:click="search" v-bind:disabled="!canSearch">
                <i class="fa fa-search"></i>
                Search
            </button>
        </div>
    </div>
</template>

<script>
import { globals } from '../../../../models/globals';
import { enums } from '../../../../models/enums';
import { queryHelper } from './query-helper';
import datePicker from 'vue-bootstrap-datetimepicker';
import Vue from 'vue';

let self;
export default {

    name: 'filter-component',
    props: ["filterForm"],
    data() {
        return {
            eventsLength: 0,
            filterFormObj: this.filterForm,
            groupings: ['userName', 'referrer', 'remoteAddress', 'countryCode', 'events.url',
                'events.search.origin.code', 'events.search.level.name', 'events.search.category.name', 'events.search.language.name',
                'detectRtc.osName', 'detectRtc.browser.name', 'application.code'],
            browsers: ['Chrome', 'Firefox', 'Safari', 'Others'],
            osNames: ['Windows', 'Android', 'Linux', 'iOS'],
            applications: globals.applications,
            eventLogs: this.getEventLogs(),
            isRequesting: false,
            pageSizeChoices: [5, 10, 20, 50, 100],
            pageSize: 10,
            connectionsArray: []
        }
    },
    methods: {
        getEventLogs: function () {
            var eventNames = [];
            for (var property in enums.eventLogs) {
                if (enums.eventLogs.hasOwnProperty(property)) {
                    eventNames.push(enums.eventLogs[property]);
                }
            }
            return eventNames;
        },
        search: function () {
            if (this.pageSize != this.filterFormObj.pageSize) {
                this.filterFormObj.pageSize = this.pageSize;
            }

            if (this.filterFormObj.isDetailed && this.filterFormObj.groupBy === null) {
                this.filterFormObj.isFirstRequest = true;
            }

            this.filterFormObj.lastId = "";
            this.searchData(this.filterFormObj, false);
        },
        onFilterChange: function (count) {
            var data = {
                connections: this.connectionsArray,
                count: count,
                filter: this.filterFormObj
            }
            return this.$emit('on-filter-change', data);
        },
        onFilterDataChange: function (filterForm, isMoreDataRequested, count) {
            var data = {
                connections: this.connectionsArray,
                count: count,
                filter: filterForm,
                isMoreDataRequested: isMoreDataRequested
            }
            return this.$emit('on-filter-change', data);
        },
        searchData: function (filterForm, isMoreDataRequested) {
            this.connectionsArray = [];
            var data = queryHelper.getData(filterForm);
            self = this;
            console.log("Entered parameters: " + JSON.stringify(data));
            return new Promise(function (resolve, reject) {
                return globals.xAnalytics.api.getAnalytics(data, function (result) {
                    if (result.error) {
                        reject(result.message);
                    } else {
                        var count;
                        if (filterForm.isDetailed || (!filterForm.isDetailed && filterForm.groupBy !== null)) {
                            if (filterForm.groupBy === null && filterForm.isFirstRequest) {
                                count = result && result.length > 0 ? result[0].count : 0;
                            } else {
                                self.connectionsArray = result;
                                filterForm.lastId = result && result.length > 0 ? self.connectionsArray[self.connectionsArray.length - 1]._id : "";
                            }
                            self.onFilterDataChange(filterForm, isMoreDataRequested, count);
                        } else {
                            var count = result && result.length > 0 ? result[0].count : 0;
                            self.onFilterDataChange(filterForm, isMoreDataRequested, count);
                        }
                        resolve(result);
                    }
                });
            });
        }
    },
    computed: {
        canSearch: function () {
           return this.filterFormObj && this.filterFormObj.from != null && this.filterFormObj.to != null && !this.isRequesting;
        }
    },
    components: {
        datePicker
    }
}
</script>
