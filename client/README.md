How to use it:
    `var xa = new XAnalytics(options);`


Possible options:
* **getUserInfoUrl**: url to obtain user information based on token stored in local storage or session storage
* **serverUrl**: url where to log the analytics data
* **application**: json object 
    - code: application code as identifier 
    - url: application url
* **timeInterval**: retry time interval. Default value 2000 (ms)
* **numberOfTrials**: numer of retries to try to send via WS before it uses plain AJAX
* **onData**: callback that is called on WS message from server received