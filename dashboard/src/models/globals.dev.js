module.exports = {
  // input parameters
  xAnalytics: null,
  serverUrl: 'https://localhost:444',
  getUserInfoLocation: 'https://localhost:444/api/auth/getUserInfo',
  application: {
    code: 'dev',
    url: 'http://localhost:8080'
  },
  applications: [{
      code: 'dev',
      url: 'http://localhost:8080'
    },
    {
      code: 'mk',
      url: 'https://www.xplorify.mk'
    },
    {
      code: 'net',
      url: 'https://www.xplorify.net'
    },
    {
      code: 'blog-mk',
      url: 'https://blog.xplorify.mk'
    },
    {
      code: 'xplorify-promo',
      url: 'https://teach.xplorify.net'
    },
    {
      code: 'xplorify-hello',
      url: 'https://hello.xplorify.net'
    },
    {
      code: 'blog-net',
      url: 'https://blog.xplorify.net'
    },
    {
      code: 'test2',
      url: 'https://test2.xplorify.net'
    }
  ]
};

// export let globals = result;
