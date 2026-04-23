export default {
  silenceDeprecations: ['legacy-js-api'],
  quietDeps: true,
  logger: {
    warn: function(message) {
      if (message.includes('legacy-js-api')) {
        return; // Suppress legacy API warnings
      }
      console.warn(message);
    }
  }
};