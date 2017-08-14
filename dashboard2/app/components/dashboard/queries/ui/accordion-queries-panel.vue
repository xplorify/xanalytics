<template>
    <div class="w3-row w3-card" style="margin-left: 1%; margin-top:1%">
        <span v-if="conn.url">
            <span class="w3-hide-small w3-hide-medium">
                <button class="w3-button w3-small w3-blue" v-on:click="goToUrl(conn.url)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
            <span  class="w3-hide-large">
                <button class="w3-button w3-tiny w3-blue" v-on:click="goToUrl(conn.url)">
                    <i class="fa fa-reply"></i>
                </button>
            </span>
        </span>
        <span>{{conn.eventType}}</span>,
        <span style="overflow-wrap: break-word" v-if="conn.url">{{conn.url}},</span>
        <span v-if="conn.info">
            <span v-if="conn.info.loginType">{{conn.info.loginType}},</span>
            <span v-if="conn.info.roomId">{{conn.info.roomId}},</span>
        </span>
        <span v-if="conn.search">
            <span v-if="conn.search.level" v-bind:id="conn.search.level.id">{{conn.search.level.name}},</span>
            <span v-if="conn.search.category" v-bind:id="conn.search.category.id">{{conn.search.category.name}},</span>
            <span v-if="conn.search.language" v-bind:id="conn.search.language.id">{{conn.search.language.name}},</span>
            <span v-if="conn.search.origin">
                <span>{{conn.search.origin.code}},</span>
                <span> {{conn.search.origin.name}},</span>
            </span>
            <span v-if="conn.search.words">{{conn.search.words}}</span>
        </span>
        <span>{{conn.date}}</span>
    </div>
</template>

<script>
export default {

    name: 'accordion-queries-panel',
    props: ['connEvent'],
    data() {
        return {
            conn: this.connEvent
        }
    },
    methods: {
        goToUrl: function (url) {
            window.location.href = url;
        }
    }
}
</script>
