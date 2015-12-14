var Docker      = require('dockerode');
var docker 	    = new Docker();
var consul      = require('consul')();
var async 	    = require('async');

var tick = process.env.TICK || 10000;
var registrations = {}

setInterval(function () {
  docker.listContainers(function (err, containers) {
    async.map(containers, register, function (err, res) {
      console.log('Reaping out of date registrations');
      var active = Object.keys(registrations);
      console.log('Active Registration Ids', active);
      active.forEach(function (id) {
        if (res.indexOf(id) === -1) {
      	  console.log('Reaping', id);
          var container = registrations[id];
          consul.agent.service.deregister({name: container.Labels['com.application.name'], id: container.Id, port: container.Ports[0].PublicPort}, function(err) {
            if (err) {
              console.warn(err, err.stack);
            }
            // client.unregister(reg.role, reg.version, reg.port)
	         delete registrations[id]
         })
        }
      })
    })
    
  })
}, tick)

function register(container, cb) {
  try {
    if (container.Labels['com.application.name'] === undefined) {
      console.log('skipping', container.Id, container.Labels);
      return cb(null, container.Id);
    }
    if (registrations[container.Id] === 'healthcheck') {
      console.log(container.Id, 'awating healthcheck');
      return cb(null, container.Id);
    }
    if (registrations[container.Id] !== undefined) {
      console.log(container.Id, 'already registered')
      return cb(null, container.Id);
    }

    // use a seperator of ':::'
    var serviceName = container.Labels['com.application.name'];
    console.log('Registering', serviceName)
  } catch (err) {
    console.warn(err, err.stack)
    return cb(null, '');
  }
  consul.agent.service.register({name: serviceName, id: container.Id, port: container.Ports[0].PublicPort}, function(err) {
    if (err) {
      console.warn(err, err.stack)
      throw cb(null, '');
    }
    registrations[container.Id] = container;
    console.log('Registered', container.Id)
    return cb(null, container.Id);
  });
  
}
//healthcheck register
// function _register (container, meta, maxRetries, cb) {
//   registrations[container.Id] = 'healthcheck';
//   if (maxRetries === 0) {
//     delete registrations[container.Id]
//     return cb(null, container.Id)
//   }

//   request('http://localhost:' + meta.port, function (err, response, body) {
//     if (err) {
//       return setTimeout(function () {
//         _register(container, meta, maxRetries - 1, cb);
//       }, 1000);
//     } else { 
//       console.log(container.Id, 'passed healthcheck with body', body);
//       client.register(meta.role, meta.version, meta.port, meta);
//       registrations[container.Id] = meta;
//       return cb(null, container.Id)
//     }
//   });
// }
