<template>
    <div style="margin-bottom: 2%">
        <div class="w3-row">
            <div @click="exportAsImage" class="w3-btn">
                <i class="fa fa-download"></i>
                <span>Export</span>
            </div>
        </div>
        <div class="container w3-blue" v-on:click="toggleChart()">
            <div class="w3-panel">
                Chart
            </div>
        </div>
        <div v-bind:class="[isActive ? 'w3-show' : 'w3-hide']">
            <example-chart v-bind:filter-form="filterForm" v-bind:connectionsArray="connectionsArray"></example-chart>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';

Vue.component('example-chart', require('../charts/example-chart.vue'));
let self;
export default {

    name: 'accordion-chart',
    props: ['filterForm', 'connections'],
    data() {
        return {
            isActive: false
        }
    },
    methods: {
        toggleChart: function () {
            this.isActive = !this.isActive;

            if (this.isActive) {
                document.getElementById("line-chart").style.height = "400px";
            }
        },
        exportAsImage: function () {
            let canvas = document.getElementById('line-chart').toDataURL('image/png')
            let link = document.createElement('a')
            link.download = 'image'
            link.href = canvas
            link.click()
        }
    },
    computed: {
        connectionsArray: function () {
            return this.connections;
        }
    }
}
</script>
