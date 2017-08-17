<template>
  <div class="w3-row">
    <!-- Desktop filter -->
    <div class="w3-col s3 w3-hide-small w3-hide-medium">
      <div class="w3-row">
        <filter-component v-bind:filter-form="filterForm" v-on:on-filter-change="onFilterChange"></filter-component>
      </div>
    </div>
    <!-- Mobile filter -->
    <div class="w3-col s12 w3-hide-large">
      <div class="w3-row">
        <filter-mobile v-bind:filter-form="filterForm" v-on:on-filter-change="onFilterChange"></filter-mobile>
      </div>
    </div>
    <div v-if="canSeeCharts">
      <div class="w3-rest w3-hide-small  w3-hide-medium">
        <accordion-chart v-bind:filter-form="filterForm" v-bind:connections="connections"></accordion-chart>
      </div>
    </div>
    <div class="w3-rest w3-hide-small  w3-hide-medium">
      <div v-if="isGrouped && reportId == null">
        <accordion-grouped :filter-form="filterForm" :connections="connections"></accordion-grouped>
      </div>
      <div v-if="isGrouped  && reportId != null">
        <div class="w3-panel w3-blue w3-round-large w3-center">
          <p class="w3-margin">You are currently seeing report with ID: {{reportId}}</p>
        </div>
        <div style="margin-left:2%">
          <report-grouped :filter-form="filterForm" :connections="connections"></report-grouped>
        </div>
      </div>
      <div v-if="!isGrouped && (totalCount > 0 || connections.length > 0)">
        <div class="container">
          <div class="row">
            <div v-if="filterForm.isDetailed">
              <div class="w3-panel w3-indigo" v-on:click="toggle">
                <p class="w3-padding">
                  <span v-if="filterForm.navigateTo || filterForm.eventType != null">
                    Events
                  </span>
                  <span v-if="!filterForm.navigateTo && filterForm.eventType == null">
                    Connections
                  </span>
                  <span class="w3-badge w3-right w3-green" v-if="totalCount">
                    <span v-if="connections && connections.length > 0">
                      <span v-if="filterForm.navigateTo || filterForm.eventType !=null">
                        {{eventsLength}} /
                      </span>
                      <span v-if="!filterForm.navigateTo && filterForm.eventType == null">
                        {{connections.length}} /
                      </span>
                    </span> {{totalCount}}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-bind:class="[showMore ? 'w3-show' : 'w3-hide']">
          <div v-if="connections && connections.length > 0">
            <div class="w3-row" v-for="connection in connections" v-bind:key="connection.id">
              <accordion-queries v-bind:connection="connection" v-bind:filter-form="filterForm"></accordion-queries>
            </div>
            <div v-if="connections && connections.length > 0 && (((filterForm.navigateTo  || filterForm.eventType != 'null') && eventsLength < totalCount) || (!filterForm.navigateTo && filterForm.eventType == 'null' && connections.length < totalCount))" class="tablink w3-hover-light-grey w3-padding w3-center">
              <a v-on:click="loadMore">
                <i class="fa fa-circle-o-notch"></i>
                <span>Load More</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-if="count" class="w3-margin">
        <div class="w3-panel w3-blue w3-round-large w3-center">
          <p v-if="(filterForm.navigateTo || filterForm.eventType != null) && !filterForm.isDetailed" class="w3-margin">The number of events is: {{count}}</p>
          <p v-if="!filterForm.navigateTo && filterForm.eventType == null  && !filterForm.isDetailed" class="w3-margin">The number of connections is: {{count}}</p>
        </div>
      </div>
      <div v-if="!count && totalCount == 0 && connections.length == 0" class="w3-margin">
        <div class="w3-panel w3-blue w3-round-large w3-center">
          <p class="w3-margin">There aren't any connections
            <i class="w3-large fa fa-exclamation-circle"></i>
          </p>
        </div>
      </div>
    </div>
    <div class="w3-row w3-hide-large">
      <div v-if="isGrouped && reportId == null">
        <accordion-grouped :filter-form="filterForm" :connections="connections"></accordion-grouped>
      </div>
      <div v-if="isGrouped  && reportId != null">
        <div class="w3-blue w3-round-small w3-center">
          <p class="w3-margin">Report ID: {{reportId}}</p>
        </div>
        <report-grouped :filter-form="filterForm" :connections="connections"></report-grouped>
      </div>
      <div v-if="!isGrouped && (totalCount > 0 || connections.length > 0)">
        <div class="container">
          <div class="row">
            <div v-if="filterForm.isDetailed">
              <div class="w3-panel w3-indigo" v-on:click="toggle">
                <p class="w3-padding">
                  <span v-if="filterForm.navigateTo || filterForm.eventType != null">
                    Events
                  </span>
                  <span v-if="!filterForm.navigateTo && filterForm.eventType == null">
                    Connections
                  </span>
                  <span class="w3-badge w3-right w3-green" v-if="totalCount">
                    <span v-if="connections && connections.length > 0">
                      <span v-if="filterForm.navigateTo || filterForm.eventType !=null">
                        {{eventsLength}} /
                      </span>
                      <span v-if="!filterForm.navigateTo && filterForm.eventType == null">
                        {{connections.length}} /
                      </span>
                    </span> {{totalCount}}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-bind:class="[showMore ? 'w3-show' : 'w3-hide']">
          <div v-if="connections && connections.length > 0">
            <div class="w3-row" v-for="connection in connections" v-bind:key="connection.id">
              <accordion-queries v-bind:connection="connection" v-bind:filter-form="filterForm"></accordion-queries>
            </div>
            <div v-if="connections && connections.length > 0 && (((filterForm.navigateTo  || filterForm.eventType != 'null') && eventsLength < totalCount) || (!filterForm.navigateTo && filterForm.eventType == 'null' && connections.length < totalCount))" class="tablink w3-hover-light-grey w3-padding w3-center">
              <a v-on:click="loadMore">
                <i class="fa fa-circle-o-notch"></i>
                <span>Load More</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div v-if="count" class="w3-margin">
        <div class="w3-panel w3-blue w3-round-large w3-center">
          <p v-if="(filterForm.navigateTo || filterForm.eventType != null) && !filterForm.isDetailed" class="w3-margin">The number of events is: {{count}}</p>
          <p v-if="!filterForm.navigateTo && filterForm.eventType == null  && !filterForm.isDetailed" class="w3-margin">The number of connections is: {{count}}</p>
        </div>
      </div>
      <div v-if="!count && totalCount == 0 && connections.length == 0" class="w3-margin">
        <div class="w3-panel w3-blue w3-round-large w3-center">
          <p class="w3-margin">There aren't any connections
            <i class="w3-large fa fa-exclamation-circle"></i>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryHelper } from './ui/query-helper';
import { globals } from '../../../models/globals';
import router from '../../../router';
import moment from 'moment';
import Vue from 'vue';

Vue.component('filter-component', require('./ui/filter-component'));
Vue.component('filter-mobile', require('./ui/filter-mobile'));
Vue.component('accordion-queries', require('./ui/accordion-queries'));
Vue.component('accordion-grouped', require('./ui/accordion-grouped'));
Vue.component('report-grouped', require('./ui/report-grouped'));
Vue.component('accordion-chart', require('./ui/accordion-chart'));


let self;
export default {

  name: 'queries',
  data() {
    return {
      filterForm: {
        from: null,
        to: null,
        username: "",
        countryCode: "",
        ipAddress: "",
        referrer: "",
        navigateTo: "",
        groupBy: null,
        browser: null,
        operatingSystem: null,
        application: null,
        eventType: null,
        isDetailed: false,
        pageSize: 10,
        lastId: "",
        lastIds: [],
        key: "",
        isFirstRequest: false
      },
      connections: [],
      count: null,
      isGrouped: false,
      totalCount: 0,
      eventsLength: 0,
      showMore: false,
      reportId: null,
      grouping: null
    }
  },
  created: function () {
    console.log(this.$route);
    this.reportId = this.$route.query.r;
    this.grouping = this.$route.query.g;
    if (this.reportId) {
      this.filterForm.isDetailed = true;
      switch (this.grouping) {
        case "browser":
          this.filterForm.groupBy = "detectRtc.browser.name";
          break;
        case "country":
          this.filterForm.groupBy = "countryCode";
          break;
        case "address":
          this.filterForm.groupBy = "remoteAddress";
          break;
        case "referrer":
          this.filterForm.groupBy = "referrer";
          break;
        case "username":
          this.filterForm.groupBy = "userName";
          break;
        case "application":
          this.filterForm.groupBy = "application.code";
          break;
      }

      this.isGrouped = true;
      self = this;
      // make lookup mongodb request
      return this.getReportById(this.reportId, this.filterForm.groupBy)
        .then(function (result) {
          self.filterForm.from = new Date(result.from);
          self.filterForm.to = new Date(result.to);
          self.connections = result.data;
        });
    }
  },
  mounted: function () {
    document.getElementById("groupDemo").innerHTML = this.filterForm.groupBy ? this.filterForm.groupBy : "-Choose Grouping-";
  },
  methods: {
    onFilterChange: function (filterResult) {
      this.reportId = null;
      this.connections = filterResult.connections;
      this.count = filterResult.count;
      this.filterForm = filterResult.filter;
      if (filterResult.filter.isFirstRequest) {
        this.filterForm.isFirstRequest = false;
        this.totalCount = filterResult.count;
      }
      this.isGrouped = this.filterForm.groupBy != null;
    },
    loadMore: function () {
      this.filterForm.isFirstRequest = false;
      self = this;
      return this.search(this.filterForm, true)
        .then(function (result) {
          self.getEventsLength(self.connections);
        });
    },
    onFilterDataChange: function (filterForm, isMoreDataRequested, count) {
      var filterResult = {
        connections: self.connections,
        count: count,
        filter: filterForm,
        isMoreDataRequested: isMoreDataRequested
      }
      self.onFilterChange(filterResult);
    },
    search: function (filterForm, isMoreDataRequested) {
      var connectionsArray = [];
      var data = queryHelper.getData(filterForm);
      self = this;
      console.log("Entered parameters: " + JSON.stringify(data));
      return new Promise(function (resolve, reject) {
        globals.xAnalytics.api.getAnalytics(data, function (result) {
          if (result.error) {
            reject(result.message);
          } else {
            var count;
            if (filterForm.isDetailed || (!filterForm.isDetailed && filterForm.groupBy !== null)) {
              if (filterForm.groupBy === null && filterForm.isFirstRequest) {
                count = result && result.length > 0 ? result[0].count : 0;
              } else {
                connectionsArray = result;
                if (self.connections.length == 0) {
                  self.connections = connectionsArray;
                } else {
                  self.connections = self.connections.concat(connectionsArray);
                }

                filterForm.lastId = result && result.length > 0 ? connectionsArray[connectionsArray.length - 1]._id : "";
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
    },
    getReportById: function (reportId, grouping) {
      return new Promise(function (resolve, reject) {
        globals.xAnalytics.api.getReportById({ reportId: reportId, grouping: grouping }, function (result) {
          if (result.error) {
            reject(result.message);
          } else {
            resolve(result);
          }
        });
      });
    },
    getEventsLength: function (conn) {
      var events = 0;
      conn.forEach(function (connection) {
        events += connection.events.length;
      });
      this.eventsLength = events;
    },
    toggle: function () {
      if (!this.showMore) {
        //reset lastId on accordion open
        this.filterForm.key = "";
        this.filterForm.lastId = "";
        this.filterForm.isFirstRequest = false;
        self = this;
        return this.search(this.filterForm, false)
          .then(function (result) {
            self.showMore = !self.showMore;
            self.getEventsLength(self.connections);
          });
      } else {
        this.connections = [];
        this.showMore = !this.showMore;
        this.filterForm.isFirstRequest = true;
      }
    }
  },
  computed: {
    canSeeCharts: function () {
      if (this.filterForm.to && this.filterForm.from) {
        var from = moment(this.filterForm.from);
        var to = moment(this.filterForm.to);
        var duration = moment.duration(to.diff(from));
        var days = duration.asDays();
        return days > 1 && this.connections && this.connections.length > 0 && this.filterForm.groupBy != null;
      }
      return false;
    }
  }
}
</script>
