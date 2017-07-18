<template>
    <div v-bind:id="accordion.id" class="w3-margin">
        <div class="w3-row w3-blue">
            <span class="w3-col m1 l1 s2">
                <button class="w3-button w3-small w3-blue w3-block" v-on:click="goToUrl(accordion)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span class="w3-col m11 l11 s10">
                <button v-on:click="toggle(accordion)" class="w3-button w3-block w3-blue w3-left-align">
                    <span>{{accordion.title}}</span>
                    <span class="pull-right">
                        <span class="badge">{{accordion.count}}</span>
                    </span>
                </button>
            </span>
        </div>
        <div v-bind:id="panel.id" v-bind:class="[accordion.isActive ? 'w3-show' : 'w3-hide']">
            <div v-for="panel in accrodion.panels" v-bind:key="panel.id">
                <accordion-panel v-bind:panel="panel">
                </accordion-panel>
            </div>
        </div>
    </div>
</template>

<script>
import { AccordionPanel } from './accordion-panel';

export default {

    name: 'accordion-panel',
    props: {
        accordion: {
            type: Object
        }
    },
    data() {
        return {}
    },
    components: {
        'accordion-panel': AccordionPanel
    },
    methods: {
        toggle: function (accordion) {
            accordion.isActive = !accordion.isActive;
        },
        goToUrl: function (accordion) {
            var url = accordion.panels[0].title;
            return this.router.go(url);
        }
    }
}
</script>
