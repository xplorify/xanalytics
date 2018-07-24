class ValidationService {

    isUserNameValid(userName) {
        var letters = /^[a-z][a-z0-9]*$/i;
        return userName.match(letters) != null;
    }

    isPasswordValid(password) {
        return password != '' && password.length > 7;
    }

    isFirstNameValid(firstName) {
        var letters = new RegExp("^[^0-9@#!%&()_=+{}<>?$.,-]*$");
        return firstName.match(letters) != null;
    }

    isEmailAddressValid(emailAddress) {
        var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(emailAddress);
    }

}

export let validationService = new ValidationService();