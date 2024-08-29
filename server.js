#!/usr/bin/env node
'use strict';

const Fastify = require('fastify');
const fastifyExpress = require('@fastify/express');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 3000;

const fastify = Fastify({ 
  logger: true,
  disableRequestLogging: true,
  trustProxy: true // Enable trust proxy
});

fastify.register(fastifyExpress).after(() => {
  fastify.get('/', proxy);
  fastify.get('/favicon.ico', (req, res) => res.status(204).end());
});

// Start the server
  fastify.listen({host: '0.0.0.0' , port: PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
});
