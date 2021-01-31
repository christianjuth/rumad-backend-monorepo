const tcpPortUsed = require('tcp-port-used')
const path = require('path')

exports.ifPortIsFree = (port, ifFreeCallback) => {
  tcpPortUsed.check(port, '127.0.0.1')
  .then(inUse => {
    if (!inUse) {
      ifFreeCallback()
    }
  })
}

exports.availableRoutesString = (subAppsObj) => {
  return Object.entries(subAppsObj).map(([key, subApp]) => {
    return subApp.app._router.stack
      .filter(r => r.route)
      .map(r => Object.keys(r.route.methods)[0].toUpperCase().padEnd(7) + path.normalize(`/${key}/${r.route.path}`))
  }).flat()
}

exports.expressExposeSubApps = (app, subAppsObj) => {
  Object.entries(subAppsObj).forEach(([key, subApp]) => {
    app.use(`/${key}`, subApp.app)
  })
}