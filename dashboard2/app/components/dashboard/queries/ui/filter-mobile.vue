<template>
    <div class="w3-row">
        <div class="w3-card-4">
            <div class="w3-container w3-blue w3-hide-large" v-on:click="toggleFilter">
                <h4>Filter</h4>
            </div>
            <div v-bind:class="[isActive ? 'w3-show' : 'w3-hide']">
                <form class="w3-container" v-if="filterFormObj">
                    <div style="width: 100%" class="w3-third tablink w3-bottombar" v-on:click="toggleConnection">
                        <h4>
                            <i class="fa fa-tag w3-text-blue"></i>
                            <span class="w3-text-blue">Connection</span>
                        </h4>
                    </div>
                    <div v-bind:class="[isConnectionActive ? 'w3-show' : 'w3-hide']">
                        <div class="w3-row filter-margin" style="position:relative">
                            <date-picker class="w3-input w3-border w3-text-blue w3-white w3-border-blue" style="border-radius: 0px" v-model="filterFormObj.from" v-bind:config="{format: 'YYYY-MM-DD'}" :placeholder="from"></date-picker>
                        </div>
                        <div class="w3-row" style="margin-top:2%; position:relative">
                            <date-picker class="w3-input w3-border w3-text-blue w3-white w3-border-blue" style="border-radius: 0px" v-model="filterFormObj.to" v-bind:config="{format: 'YYYY-MM-DD'}" :placeholder="to"></date-picker>
                        </div>
                        <p>
                            <p>
                                <input class="w3-input w3-border w3-text-blue w3-white w3-border-blue" type="text" v-bind:value="filterFormObj.username" placeholder="Username">
                            </p>
                            <p>
                                <input class="w3-input w3-border w3-text-blue w3-white w3-border-blue" type="text" v-bind:value="filterFormObj.ipAddress" placeholder="Ip Address">
                            </p>
                            <p>
                                <input class="w3-input w3-border w3-text-blue w3-white w3-border-blue" type="text" v-bind:value="filterFormObj.countryCode" placeholder="Country Code">
                            </p>
                            <p>
                                <input class="w3-input w3-border w3-text-blue w3-white w3-border-blue" type="text" v-bind:value="filterFormObj.referrer" placeholder="Referrer">
                            </p>
                            <p>
                                <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('browserDemo')" id="brDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Browser-</a>
                                    <div id="browserDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'browserDemo', 'brDemo', 'browser')">-Choose Browser-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="browserName in browsers" v-bind:key="browserName" @click="setItem(browserName,'browserDemo', 'brDemo', 'browser')">
                                            {{browserName}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                            <p>
                                <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('osDemo')" id="oSystemDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Operating System-</a>
                                    <div id="osDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'osDemo', 'oSystemDemo', 'os')">-Choose Operating System-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="osName in osNames" v-bind:key="osName" @click="setItem(osName, 'osDemo', 'oSystemDemo', 'os')">
                                            {{osName}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                            <p>
                                <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('appDemo')" id="applicationDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Application-</a>
                                    <div id="appDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'appDemo', 'applicationDemo', 'app')">-Choose Application-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="app in applications" v-bind:key="app.code" @click="setItem(app.code, 'appDemo', 'applicationDemo', 'app')">
                                            {{app.code}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                        </p>
                    </div>
                    <p>
                        <div style="width: 100%" class="w3-third tablink w3-bottombar" v-on:click="toggleEvent">
                            <h4>
                                <i class="fa fa-tags w3-text-blue"></i>
                                <span class="w3-text-blue">Event</span>
                            </h4>
                        </div>
                        <div v-bind:class="[isEventActive ? 'w3-show' : 'w3-hide']">
                            <p class="event-margin">
                                <input class="w3-input w3-border w3-text-blue w3-white w3-border-blue" type="text" v-bind:value="filterFormObj.navigateTo" placeholder="Navigate To">
                            </p>
                            <p>
                                <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('Demo')" id="eventDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Event Type-</a>
                                    <div id="Demo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'Demo', 'eventDemo', 'event')">-Choose Event Type-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="eventLog in eventLogs" v-bind:key="eventLog" @click="setItem(eventLog,'Demo', 'eventDemo', 'event')">
                                            {{eventLog}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                        </div>
                        <div style="width: 100%; margin-bottom: 2%" class="w3-third tablink w3-bottombar" v-on:click="toggleAggregation">
                            <h4>
                                <i class="fa fa-plus w3-text-blue"></i>
                                <span class="w3-text-blue">Aggregation</span>
                            </h4>
                        </div>
                        <div v-bind:class="[isAggregationActive ? 'w3-show' : 'w3-hide']">
                            <p>
                                <input class="w3-check" type="checkbox" v-model="filterFormObj.isDetailed">
                                <label class="w3-text-blue">Detailed search</label>
                            </p>
                            <p>
                                 <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('grDemo')" id="groupDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Grouping-</a>
                                    <div id="grDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'grDemo', 'groupDemo', 'grouping')">-Choose Grouping-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="grouping in groupings" v-bind:key="grouping" @click="setItem(grouping, 'grDemo', 'groupDemo', 'grouping')">
                                            {{grouping}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                            <p v-if="filterFormObj.isDetailed">
                                 <div class="w3-dropdown-click w3-block">
                                    <a @click="showItems('psDemo')" id="pgsDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Select Page Size-</a>
                                    <div id="psDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'psDemo', 'pgsDemo', 'pageSize')">-Select Page Size-</div>
                                        <div class="w3-bar-item w3-button w3-text-blue" v-for="size in pageSizeChoices" v-bind:key="size" @click="setItem(size, 'psDemo', 'pgsDemo', 'pageSize')">
                                            {{size}}
                                        </div>
                                    </div>
                                </div>
                            </p>
                        </div>
                    </p>
                </form>
                <button class="w3-btn w3-block w3-blue" v-on:click="search" v-bind:disabled="!canSearch">
                    <i class="fa fa-search"></i>
                    Search
                </button>
            </div>
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

    name: 'filter-mobile',
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
            eventLogs: this.getEventLogs(),
            isRequesting: false,
            pageSizeChoices: [5, 10, 20, 50, 100],
            pageSize: 10,
            connectionsArray: [],
            report: this.reportId,
            isActive: false,
            isConnectionActive: false,
            isEventActive: false,
            isAggregationActive: false,
            from: "From",
            to: "To"
        }
    },
    mounted: function(){
        this.setItem(this.filterFormObj.pageSize, 'psDemo', 'pgsDemo', 'pageSize');
         this.showItems('psDemo');
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
        toggleFilter: function () {
            return this.isActive = !this.isActive;
        },
        toggleConnection: function () {
            return this.isConnectionActive = !this.isConnectionActive;
        },
        toggleEvent: function () {
            return this.isEventActive = !this.isEventActive;
        },
        toggleAggregation: function () {
            return this.isAggregationActive = !this.isAggregationActive;
        },
        showItems: function (itemId) {
            var x = document.getElementById(itemId);
            if (x.className.indexOf("w3-show") == -1) {
                x.className += " w3-show";
            } else {
                x.className = x.className.replace(" w3-show", "");
            }
        },
        getTextByType: function (type) {
            var text;
            switch (type) {
                case "event":
                    text = "-Choose Event Type-";
                    break;
                case "app":
                    text = "-Choose Application-";
                    break;
                case "os":
                    text = "-Choose Operating System-";
                    break;
                case "browser":
                    text = "-Choose Browser-";
                    break;
                case "grouping":
                    text = "-Choose Grouping-";
                    break;
                case "pageSize":
                    text = "-Select Page Size-";
                    break;
                default:
                text = "";
                    break;
            }
            return text;
        },
        setFilterByType: function (type, item) {
            switch (type) {
                case "event":
                    this.filterFormObj.eventType = item;
                    break;
                case "app":
                    this.filterFormObj.application = item;
                    break;
                case "os":
                    this.filterFormObj.operatingSystem = item;
                    break;
                case "browser":
                   this.filterFormObj.browser = item;
                   break;
                case "grouping":
                    this.filterFormObj.groupBy = item;
                    break;
                case "pageSize":
                    this.filterFormObj.pageSize = item;
                    break;
            }
        },
        setItem: function (item, itemId, parentId, type) {
            this.setFilterByType(type, item);
            this.showItems(itemId);
            document.getElementById(parentId).innerHTML = item ? item : this.getTextByType(type);
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
        },
        applications: function () {
             return globals.applications;
        }
    },
    components: {
        datePicker
    }
}
</script>
