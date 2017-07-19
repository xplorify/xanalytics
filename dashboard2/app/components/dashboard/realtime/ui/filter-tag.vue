<template>
    <div>
        <div class="w3-row">
            <span class="w3-col l10 m10 s10 w3-panel w3-pale-green w3-center">
                <i class="fa fa-info-circle"></i>
                <span>Connections count</span>
                <span>{{getConnectionsCount}}</span>
            </span>
        </div>
        <div class="w3-row">
            <span class="w3-col l8 m8 s10">
                <select v-model="application" class="w3-btn w3-block w3-border w3-border-blue" v-on:change="onAppChange">
                    <option value="">-Choose Application-</option>
                    <option v-for="app in applications" v-bind:key="app.code">{{app.code}}</option>
                </select>
            </span>
            <span class="w3-col l4 m4 s2">
                <button class="w3-btn w3-small w3-green" v-on:click="refresh()">
                    <i class="fa fa-refresh"></i>
                </button>
            </span>
        </div>
    </div>
</template>

<script>
import { globals } from '../../../../models/globals';

export default {

    name: 'filter-tag',
    props: ['selectedApplication', 'analyticsModel', 'getConnectionsCount'],

    data() {
        return {
            applications: globals.applications,
            application: this.selectedApplication,
            analytics: this.analyticsModel
        }
    },
    created: function () {
        this.application = "";
    },
    methods: {
        refresh: function () {
            this.analytics.connections = [];
            return this.$emit('on-change', this.application);
        },
        onAppChange: function () {
            return this.$emit('on-change', this.application);
        }
    }
}
</script>
