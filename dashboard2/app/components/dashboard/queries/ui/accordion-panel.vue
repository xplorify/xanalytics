<template>
    <div class="w3-row" style="margin-left: 5%; margin-top:1%">
        <span v-if="connectionEvent.url"> 
            <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(url)">
                <i class="fa fa-reply"></i>
            </button>
        </span>
        <span>{{connectionEvent.eventType}}</span>,
        <span v-if="connectionEvent.url">{{connectionEvent.url}},</span>
        <span v-if="connectionEvent.info">
            <span v-if="connectionEvent.info.loginType">{{connectionEvent.info.loginType}},</span>
        <span v-if="connectionEvent.info.roomId">{{connectionEvent.info.roomId}},</span>
        </span>
        <span v-if="connectionEvent.search">
            <span v-if="connectionEvent.search.level" v-bind:id="connectionEvent.search.level.id">{{connectionEvent.search.level.name}},</span>
            <span v-if="connectionEvent.search.category" v-bind:id="connectionEvent.search.category.id">{{connectionEvent.search.category.name}},</span>
            <span v-if="connectionEvent.search.language" v-bind:id="connectionEvent.search.language.id">{{connectionEvent.search.language.name}},</span>
            <span v-if="connectionEvent.search.origin"><span>{{connectionEvent.search.origin.code}},</span><span> {{connectionEvent.search.origin.name}},</span></span>
            <span v-if="connectionEvent.search.words">{{connectionEvent.search.words}}</span>
        </span>
        <span>{{connectionEvent.date}}</span>
    </div>
</template>

<script>
export default {

    name: 'accordion-panel',
    data() {
        return { }
    },
    methods: {
        goToUrl: function (url) {
           window.location.href = url;
        }
    }
}
</script>
