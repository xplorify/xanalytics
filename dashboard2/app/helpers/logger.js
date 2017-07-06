import * as toastr from 'toastr';

class Logger {

    logIt(message, data, source, showToast, toastType) {
        if (showToast) {
            if (toastType === 'error') {
                toastr.error(message);
            } else if (toastType === 'success') {
                toastr.success(message);
            } else if (toastType === 'warning') {
                toastr.warning(message);
            } else {
                toastr.info(message);
            }
        }
    }

    log(message, data, source, showToast) {
        return this.logIt(message, data, source, showToast, 'info');
    }

    logError(message, data, source, showToast) {
        return this.logIt(message, data, source, showToast, 'error');
    }

    logSuccess(message, data, source, showToast) {
        return this.logIt(message, data, source, showToast, 'success');
    }

    logWarning(message, data, source, showToast) {
        return this.logIt(message, data, source, showToast, 'warning');
    }
}

export let logger = new Logger();