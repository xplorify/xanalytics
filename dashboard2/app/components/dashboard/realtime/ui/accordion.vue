<template>
    <div v-bind:id="accordionObj.id" class="w3-margin">
        <div class="w3-row w3-blue">
            <span class="w3-col m1 l1 s2">
                <button class="w3-button w3-small w3-blue w3-block" v-on:click="goToUrl(accordionObj)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span class="w3-col m11 l11 s10">
                <button v-on:click="toggle(accordionObj)" class="w3-button w3-block w3-blue w3-left-align">
                    <span>{{accordionObj.title}}</span>
                    <span class="pull-right">
                        <span class="badge">{{accordionObj.count}}</span>
                    </span>
                </button>
            </span>
        </div>
        <div v-bind:id="accordionObj.id" v-bind:class="[accordionObj.isActive ? 'w3-show' : 'w3-hide']">
            <div v-for="panel in accordionObj.panels" v-bind:key="panel.id">
                <accordion-panel v-bind:panel="panel">
                </accordion-panel>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import router from '../../../../router';

Vue.component('accordion-panel', require('./accordion-panel'));
export default {

    name: 'accordion',
    props: {
        accordion: {
            type: Object
        }
    },
    data() {
        return {
            accordionObj: this.accordion
        }
    },
    methods: {
        toggle: function (accordion) {
            accordion.isActive = !accordion.isActive;
        },
        goToUrl: function (accordion) {
            var url = accordion.panels[0].title;
            window.location.href = url;
        }
    }
}
</script>
