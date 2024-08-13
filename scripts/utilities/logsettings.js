// To have timestamps appear in log messages.

function addTimestampsToConsoleLogs() {
  console.log = (function() {
    const console_log = console.log;
    
    return function() {
      console_log.apply(console, [new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000), ...arguments]);
    };
  })();
}

export { addTimestampsToConsoleLogs }