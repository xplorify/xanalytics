<template>
    <div>
        <div class="w3-row">
            <span class="w3-col l12 m12 s12 w3-panel w3-pale-green w3-center">
                <i class="fa fa-info-circle"></i>
                <span>Connections count</span>
                <span>{{getConnectionsCount}}</span>
            </span>
        </div>
        <div class="w3-row right-margin" style="margin-bottom:5%">
            <div class="w3-col l11 m11 s11">
                <div class="w3-dropdown-click w3-block">
                    <a @click="showItems('appDemo')" id="applicationDemo" class="w3-text-blue  w3-white w3-btn w3-border w3-border-blue w3-block" style="text-align: left">-Choose Application-</a>
                    <div id="appDemo" class="w3-dropdown-content w3-bar-block w3-border" style="z-index: 100">
                        <div class="w3-bar-item w3-button w3-text-blue" @click="setItem(null, 'appDemo', 'applicationDemo')">-Choose Application-</div>
                        <div class="w3-bar-item w3-button w3-text-blue" v-for="app in applications" v-bind:key="app.code" @click="setItem(app.code, 'appDemo', 'applicationDemo')">
                            {{app.code}}
                        </div>
                    </div>
                </div>
            </div>
            <span class="w3-col l1 m1 s1">
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
            globals: globals,
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
        },
        setItem: function (item, itemId, parentId) {
            this.application = item;
            this.onAppChange();
            this.showItems(itemId);
            document.getElementById(parentId).innerHTML = item ? item : "-Choose Application-";
        },
        showItems: function (itemId) {
            var x = document.getElementById(itemId);
            if (x.className.indexOf("w3-show") == -1) {
                x.className += " w3-show";
            } else {
                x.className = x.className.replace(" w3-show", "");
            }
        },
    },
    computed: {
         applications: function () {
             return this.globals.applications;
        }
    }
}
</script>
