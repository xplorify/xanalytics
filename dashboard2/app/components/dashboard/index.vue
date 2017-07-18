<template>
  <section class="au-animate">
    <div class="w3-row">
      <div class="w3-row w3-margin">
        <router-link to="/" style="width: 50%;" class="w3-third tablink w3-bottombar w3-hover-light-grey w3-padding" active-class="w3-border-blue" exact>
          <i class="fa fa-user"></i>
          <span>Realtime</span>
        </router-link>
        <router-link to="/analytics" style="width: 50%;" class="w3-third tablink w3-bottombar w3-hover-light-grey w3-padding" active-class="w3-border-blue" exact>
          <i class="fa fa-user"></i>
          <span>Queries</span>
        </router-link>
      </div>
      <div class="w3-col s12">
        <router-view></router-view>
      </div>
    </div>
  </section>
</template>

<script>
export default {}
</script>
