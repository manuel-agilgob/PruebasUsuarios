const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  defaultCommandTimeout: 10000,
  video: true,
  videoCompression: 32,
  videosFolder: 'cypress/videos'
});
