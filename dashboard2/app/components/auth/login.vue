<template>
    <div class="login w3-padding-64">
        <div class="w3-container">
            <div class="w3-container w3-col l4 m4 s12"></div>
            <div class="w3-container w3-card-4 w3-col l4 m4 s12">
                <div class="w3-container w3-bottombar w3-border-blue">
                    <h2>Login</h2>
                </div>
                <div class="w3-row w3-section">
                    <div v-if="globalEnv !== 'met'" class="w3-rest">
                        <input v-model="username" v-on:keyup="isUserNameValid" class="w3-input w3-border" name="first" type="text" placeholder="Username">
                    </div>
                    <div v-else class="w3-rest">
                        <input v-model="username" v-on:keyup="isEmailValid" class="w3-input w3-border" name="email" type="email" placeholder="Enter email address">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-on:keyup="isPasswordValid" v-on:keyup.enter="login" v-model="password" class="w3-input w3-border" name="first" type="password" placeholder="Password">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <input v-model="rememberme" type="checkbox">
                    <label>Remember Me</label>
                </div>
                <button type="submit" v-on:click="login" v-bind:disabled="!isValid" class="w3-button w3-block w3-section w3-blue w3-ripple w3-padding">Sign In</button>
            </div>
        </div>
    </div>
</template>

<script>
import { authService } from "../../services/auth-service";
import { securityUtils } from "../../services/security-utils";
import { security } from "../../services/security";
import { storage } from "../../services/storage";
import { enums } from "../../models/enums";
import { globals } from "../../models/globals";
import { validationService } from "./validation/validation";
import router from "../../router";

export default {
  name: "login",
  data() {
    return {
      username: "",
      password: "",
      globalEnv: __ENV__,
      rememberme: false
    };
  },
  methods: {
    isUserNameValid: function() {
      return validationService.isUserNameValid(this.username);
    },
    isEmailValid: function() {
      return validationService.isEmailAddressValid(this.username);
    },
    isPasswordValid: function() {
      return validationService.isPasswordValid(this.password);
    },
    login: function() {
      var data = {
        username: this.username,
        password: this.password,
        rememberme: this.rememberme
      };
      return authService.login(data).then(function(response) {
        if (response && response.success) {
          securityUtils.setAccessToken(response.token, data.rememberme);
          console.log("Token: " + response.token);
          let dataObj = {
            userName: data.username ? data.username : "Anonymous",
            isAdmin:
              response.roles &&
              response.roles.length > 0 &&
              response.roles[0] === "admin",
            referrer: document.referrer,
            eventType: enums.eventLogs.login,
            loginType: enums.loginType.local
          };
          globals.xAnalytics.send(dataObj);
          security.setAuthInfo(response);
          var returnUrl = storage.getLocal("returnUrl");
          if (returnUrl) {
            window.location.href = returnUrl;
          } else {
            router.push("/");
          }
        }
      });
    }
  },
  computed: {
    isValid: function() {
      return this.globalEnv !== "met"
        ? this.isUserNameValid() && this.isPasswordValid()
        : this.isEmailValid() && this.isPasswordValid();
    }
  }
};
</script>