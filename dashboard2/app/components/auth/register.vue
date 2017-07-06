<template>
    <div class="register w3-padding-64">
        <div class="w3-container">
            <div class="w3-container w3-col l4 m4 s12"></div>
            <div class="w3-container w3-card-4 w3-col l4 m4 s12">
                <div class="w3-container w3-bottombar w3-border-blue">
                    <h2>Register</h2>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="firstname" v-on:keyup="isFirstNameValid" class="w3-input w3-border" name="firstname" type="text" placeholder="First Name">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="lastname" v-on:keyup="isLastNameValid" class="w3-input w3-border" name="lastname" type="text" placeholder="Last Name">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="username" v-on:keyup="isUserNameValid" class="w3-input w3-border" name="username" type="text" placeholder="User Name">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="email" v-on:keyup="isEmailValid" class="w3-input w3-border" name="email" type="text" placeholder="Email">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="password" v-on:keyup="isPasswordValid" class="w3-input w3-border" name="password" type="password" placeholder="Password">
                    </div>
                </div>
                <div class="w3-row w3-section">
                    <div class="w3-rest">
                        <input v-model="confirmpassword" v-on:keyup="isConfirmPasswordValid" v-on:keyup.enter="register" class="w3-input w3-border" name="confirmpassword" type="password" placeholder="Confirm Password">
                    </div>
                </div>
                <button v-on:click="register" v-bind:disabled="!isValid" type="submit" class="w3-button w3-block w3-section w3-blue w3-ripple w3-padding">Register</button>
            </div>
        </div>
    </div>
</template>

<script>
import { authService } from '../../services/auth-service';
import { validationService } from './validation/validation';
import router from '../../router';

export default {
    name: "register",
    data() {
        return {
            firstname: "",
            lastname: "",
            username: "",
            email: "",
            password: "",
            confirmpassword: ""
        }
    },
    methods: {
        isUserNameValid: function () {
            return validationService.isUserNameValid(this.username);
        },
        isFirstNameValid: function () {
            return validationService.isFirstNameValid(this.firstname);
        },
        isLastNameValid: function () {
            return validationService.isFirstNameValid(this.lastname);
        },
        isEmailValid: function () {
            return validationService.isEmailAddressValid(this.email);
        },
        isPasswordValid: function () {
            return validationService.isPasswordValid(this.password);
        },
        isConfirmPasswordValid: function () {
            return this.password === this.confirmpassword;
        },
        register: function () {
            var data = {
                firstname: this.firstname,
                lastname: this.lastname,
                username: this.username,
                email: this.email,
                password: this.password,
                confirmpassword: this.confirmpassword
            };
            return authService.register(data)
                .then(function (response) {
                    if (response && response.success) {
                        router.push('/');
                    }
                });
        }
    },
    computed: {
        isValid: function () {
            return this.isUserNameValid() &&
            this.isPasswordValid() &&
            this.isFirstNameValid() &&
            this.isLastNameValid() &&
            this.isEmailValid() &&
            this.isConfirmPasswordValid();
        }
    }
}
</script>