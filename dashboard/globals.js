let result = {
    // input parameters
    xAnalytics: null,
    serverUrl: "https://localhost:444",
    getUserInfoLocation: "https://localhost:444/api/auth/getUserInfo",
    authSchema: "JWT",
    application: {
        "code": "dev",
        "url": "http://localhost:8080"
    },
    applications: [
        {
            "code": "dev",
            "url": "http://localhost:8080"
        },
        {
            "code": "mk",
            "url": "https://www.xplorify.mk"
        },
        {
            "code": "net",
            "url": "https://www.xplorify.net"
        },
        {
            "code": "blog-mk",
            "url": "https://blog.xplorify.mk"
        },
        {
            "code": "blog-net",
            "url": "https://blog.xplorify.net"
        },
        {
            "code": "test2",
            "url": "https://test2.xplorify.net"
        }
    ]
};

export let globals = result;