<template>
  <div class="w3-row">
    <div class="w3-col s3">
      <div class="w3-row">
        <filter-tag v-bind:filter-form="filterForm" v-on:on-filter-change="onFilterChange"></filter-tag>
      </div>
    </div>
    <div class="w3-rest">
      <div v-if="isGrouped">
        <div class="w3-row" v-for="conn in connections" v-bind:key="conn.id">
          <accordion-grouped v-bind:conn="conn" v-bind:total-count="conn.count" v-bind:filter-form="filterForm"></accordion-grouped>
        </div>
      </div>
      <div v-if="!isGrouped">
        <div class="container">
          <div class="row">
            <div v-if="filterForm.isDetailed">
              <div class="w3-panel w3-indigo" v-on:click="toggle">
                <p class="w3-padding">
                  <span v-if="filterForm.navigateTo || filterForm.eventType != 'null'">
                    Events
                  </span>
                  <span v-if="!filterForm.navigateTo && filterForm.eventType == 'null'">
                    Connections
                  </span>
                  <span class="w3-badge w3-right w3-green" v-if="totalCount">
                    <span v-if="connections && connections.length > 0">
                      <span v-if="filterForm.navigateTo || filterForm.eventType !='null'">
                        {{eventsLength}} /
                      </span>
                      <span v-if="!filterForm.navigateTo && filterForm.eventType == 'null'">
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
              <accordion v-bind:connection="connection" v-bind:filter-form="filterForm"></accordion>
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
          <p v-if="(filterForm.navigateTo || filterForm.eventType != 'null') && !filterForm.isDetailed" class="w3-margin">The number of events is: ${count}</p>
          <p v-if="!filterForm.navigateTo && filterForm.eventType =='null'  && !filterForm.isDetailed" class="w3-margin">The number of connections is: ${count}</p>
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
import { QueryHelper } from './ui/query-helper';
import Vue from 'vue';

Vue.component('filter-tag', require('./ui/filter-tag'));
Vue.component('accordion', require('./ui/accordion'));
Vue.component('accordion-grouped', require('./ui/accordion-grouped'));
let self;
export default {

  name: 'queries',
  data() {
    return {
      queryHelper: QueryHelper,
      filterForm: {
        from: null,
        to: null,
        username: "",
        countryCode: "",
        ipAddress: "",
        referrer: "",
        navigateTo: "",
        groupBy: "",
        browser: "",
        operatingSystem: "",
        application: "",
        eventType: "",
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
      showMore: false
    }
  },
  methods: {
    onFilterChange: function (filterResult) {
      this.connections = filterResult.data.isMoreDataRequested ? this.connections.concat(filterResult.data.connections) : filterResult.data.connections;
      this.count = filterResult.data.count;
      this.filterForm = filterResult.data.filter;
      if (filterResult.data.filter.isFirstRequest) {
        this.filterForm.isFirstRequest = false;
        this.totalCount = filterResult.data.count;
      }
      this.isGrouped = this.filterForm.groupBy != "null";
    },
    loadMore: function () {
      this.filterForm.isFirstRequest = false;
      return this.queryHelper.search(this.filterForm, true)
        .then(function (result) {
          this.getEventsLength(this.connections);
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
        return this.queryHelper.search(this.filterForm, false)
          .then(function (result) {
            this.showMore = !self.showMore;
            this.getEventsLength(this.connections);
          });
      } else {
        this.connections = [];
        this.showMore = !this.showMore;
        this.filterForm.isFirstRequest = true;
      }
    }
  }
}
</script>
