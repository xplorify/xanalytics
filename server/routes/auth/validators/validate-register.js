const validator = require('validator');

module.exports = function(payload) {
    const errors = {};
    let isFormValid = true;
    let message = '';
    console.log('Validate register request has started...');
    if (!payload || typeof payload.username !== 'string' || payload.username.trim().length === 0) {
        isFormValid = false;
        errors.username = 'Please provide your username.';
    }

    if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
        isFormValid = false;
        errors.password = 'Password must have at least 8 characters.';
    }

    if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
        isFormValid = false;
        errors.email = 'Please provide a correct email address.';
    }

    if (!payload || typeof payload.firstname !== 'string' || payload.firstname.trim().length === 0) {
        isFormValid = false;
        errors.firstname = 'Please provide your first name.';
    }

    if (!payload || typeof payload.lastname !== 'string' || payload.lastname.trim().length === 0) {
        isFormValid = false;
        errors.lastname = 'Please provide your last name.';
    }

    if (!isFormValid) {
        message = 'Check the form for errors.';
    }
    console.log('Validate register request has finished...');
    return {
        success: isFormValid,
        message,
        errors
    };
}