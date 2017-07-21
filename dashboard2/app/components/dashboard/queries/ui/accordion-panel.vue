<template>
    <div class="w3-row" style="margin-left: 5%; margin-top:1%">
        <span v-if="conn.url"> 
            <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(url)">
                <i class="fa fa-reply"></i>
            </button>
        </span>
        <span>{{conn.eventType}}</span>,
        <span v-if="conn.url">{{conn.url}},</span>
        <span v-if="conn.info">
            <span v-if="conn.info.loginType">{{conn.info.loginType}},</span>
        <span v-if="conn.info.roomId">{{conn.info.roomId}},</span>
        </span>
        <span v-if="conn.search">
            <span v-if="conn.search.level" v-bind:id="conn.search.level.id">{{conn.search.level.name}},</span>
            <span v-if="conn.search.category" v-bind:id="conn.search.category.id">{{conn.search.category.name}},</span>
            <span v-if="conn.search.language" v-bind:id="conn.search.language.id">{{conn.search.language.name}},</span>
            <span v-if="conn.search.origin"><span>{{conn.search.origin.code}},</span><span> {{conn.search.origin.name}},</span></span>
            <span v-if="conn.search.words">{{conn.search.words}}</span>
        </span>
        <span>{{conn.date}}</span>
    </div>
</template>

<script>
export default {

    name: 'accordion-panel',
    props:['connectionEvent'],
    data() {
        return { 
            conn: this.connectionEvent
        }
    },
    methods: {
        goToUrl: function (url) {
           window.location.href = url;
        }
    }
}
</script>
