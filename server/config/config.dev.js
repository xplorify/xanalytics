var config = {};
config.env = "dev";
config.httpsPort = 444;
config.jwtSecret = "pvpnCCZfwOF85pBjbOebZiYIDhZ3w9LZrKwBZ7152K89mPCOHtbRlmr5Z91ci4L";
//config.xplorifyDb = "mongodb://XplorifyAdmin:Xp12345!@live.xplorify.net:1212/xplorifydb";
config.analyticsUrl = "http://localhost:8081/analytics";
config.xplorifyDb = "mongodb://localhost/xplorifydb";
config.serverUrl = "https://localhost:444";
config.freeGeoIpUrl = "http://geo.xplorify.net/json";
config.sendGridKey = "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";
config.application = { code: "blog", url: "https://blog.xplorify.mk" };
module.exports = config;
