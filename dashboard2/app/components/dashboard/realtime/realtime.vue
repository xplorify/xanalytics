<template>
  <div class="w3-row">
    <!-- Desktop filter -->
    <div class="w3-col s4 w3-hide-small w3-hide-medium">
      <div class="w3-row">
        <filter-tag v-bind:selected-application="selectedApplication" v-bind:analytics-model="analyticsModel" v-on:on-change="onChange" v-bind:get-connections-count="getConnectionsCount"></filter-tag>
      </div>
    </div>
     <!-- Mobile filter -->
    <div class="w3-col s12 w3-hide-large">
      <div class="w3-row">
        <filter-tag-mobile v-bind:selected-application="selectedApplication" v-bind:analytics-model="analyticsModel" v-on:on-change="onChange" v-bind:get-connections-count="getConnectionsCount"></filter-tag-mobile>
      </div>
    </div>
    <div class="w3-col s8 w3-hide-small w3-hide-medium">
      <div class="w3-row" v-for="accordion in getAccordions" v-bind:key="accordion.id">
        <accordion v-bind:accordion="accordion"></accordion>
      </div>
    </div>
    <div class="w3-col w3-hide-large">
      <div class="w3-row" v-for="accordion in getAccordions" v-bind:key="accordion.id">
        <accordion v-bind:accordion="accordion"></accordion>
      </div>
    </div>
  </div>
</template>

<script>
import { globals } from '../../../models/globals';
import { AnalyticsModel } from '../../../models/analytics';
import { Connection } from '../../../models/connection';
import Vue from 'vue';

Vue.component('filter-tag', require('./ui/filter-tag'));
Vue.component('filter-tag-mobile', require('./ui/filter-tag-mobile'));
Vue.component('accordion', require('./ui/accordion'));
let self;
export default {

  name: 'realtime',
  data() {
    return {
      globals: globals,
      selectedApplication: null,
      connectionsChanged: false,
      applications: null,
      analyticsModel: new AnalyticsModel()
    }
  },
  created: function () {
    self = this;
    self.applications = self.globals.applications;
    self.globals.xAnalytics.setOnData(self.onData);
    return self.getOpenConnections()
      .then(self.onData);
  },
  methods: {
    getOpenConnections: function (code) {
      return new Promise(function (resolve, reject) {
        self.globals.xAnalytics.api.getOpenConnections(code, function (result) {
          if (result.error) {
            reject(result.message);
          } else {
            resolve(result);
          }
        });
      });
    },
    onData: function (connections) {
      self.connectionsChanged = true;
      let isString = typeof connections === 'string';
      if (isString && connections !== 'null') {
        let connection = JSON.parse(connections);
        if (connection.removeConnection) {
          self.analyticsModel.remove(connection.removeConnection);
        } else {
          let conn = new Connection(connection, );
          self.analyticsModel.merge(conn);
        }
      } else {
        if (connections && connections.length > 0) {
          connections.forEach(function (connection) {
            let conn = new Connection(connection);
            self.analyticsModel.merge(conn);
          });
        } else {
          self.analyticsModel.connections = [];
        }
      }
    },
    onChange: function (selectedApplication) {
        self.analyticsModel.connections = [];
        return self.getOpenConnections(selectedApplication ? selectedApplication : '')
          .then(self.onData);
    }
  },
  computed: {
    getAccordions: function () {
      let groups = this.getGroupedConnections;
      let result = [];
      groups.forEach(function (item) {
        let accordion = {
          id: item.to,
          title: item.to,
          count: item.connections.length,
          panels: [],
          isActive: false
        };
        item.connections.forEach(function (connection) {
          let lastNavigateEvent = self.analyticsModel.lastNavigateEvent(connection.conn.events);

          accordion.panels.push({
            id: connection.conn.id,
            title: lastNavigateEvent ? lastNavigateEvent.url : 'N/A',
            data: connection.conn
          });
        });
        result.push(accordion);
      });

      return result;
    },
    getConnectionsCount: function () {
      self.connectionsChanged = false;
      let count = 0;
      let groupedConnections = this.getGroupedConnections;
      if (groupedConnections.length > 0) {
        groupedConnections.forEach(function (groupedConnection) {
          count += groupedConnection.connections.length;
        });
      }

      return count;
    },
    getGroupedConnections: function () {
      self.connectionsChanged = false;
      if (self.selectedApplication && self.selectedApplication.code) {
        return self.analyticsModel.groupByUrlAndCode(self.selectedApplication.code);
      }
      return self.analyticsModel.groupByUrl();
    }
  }
}
</script>
