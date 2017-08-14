<template>
    <div v-bind:id="accordionObj.id" style="margin-bottom: 1%">
        <div class="w3-row w3-blue">
            <span class="w3-col m1 l1 s2 w3-hide-small w3-hide-medium">
                <button class="w3-btn w3-small w3-blue w3-block" v-on:click="goToUrl(accordionObj)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span class="w3-col m11 l11 s10 w3-hide-small w3-hide-medium">
                <button v-on:click="toggle(accordionObj)" class="w3-btn w3-block w3-blue w3-left-align">
                    <span>{{accordionObj.title}}</span>
                    <span class="pull-right">
                        <span class="badge">{{accordionObj.count}}</span>
                    </span>
                </button>
            </span>
            <span class="w3-hide-large">
                <span v-on:click="toggle(accordionObj)" class="w3-btn w3-block w3-blue w3-left-align" style="white-space: normal">
                    <span class="w3-row">
                        <span class="w3-col m1 l1 s2">
                            <span class="w3-dropdown-hover" style="background-color: transparent">
                                <button class="w3-btn w3-blue w3-tiny" style="margin-right:2%">
                                    <i class="fa fa-caret-square-o-down"></i>
                                </button>
                                <span class="w3-dropdown-content w3-bar-block w3-border w3-card-4" style="min-width:200%; position:relative; z-index: 1">
                                    <button class="w3-btn w3-small w3-blue" v-on:click="goToUrl(accordionObj)">
                                        <i class="fa fa-reply"></i>
                                    </button>
                                    <span class="badge">{{accordionObj.count}}</span>
                                </span>
                            </span>
                        </span>
                        <span class="w3-col m11 l11 s10">
                            <span style="overflow-wrap:break-word">
                                {{accordionObj.title}}
                            </span>
                        </span>
                    </span>
                </span>
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
