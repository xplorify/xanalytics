module.exports = {
  // input parameters
  xAnalytics: null,
  serverUrl: 'https://live.xplorify.net:444',
  getUserInfoLocation: 'https://live.xplorify.net:444/api/auth/getUserInfo',
  application: {
    code: 'analytics',
    url: 'https://live.xplorify.net:444'
  },
  applications: [{
      code: 'analytics',
      url: 'https://live.xplorify.net:444'
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
