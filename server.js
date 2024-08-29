#!/usr/bin/env node
'use strict';

const Fastify = require('fastify');
const fastifyExpress = require('@fastify/express');
const proxy = require('./src/proxy');

const PORT = process.env.PORT || 8080;

const fastify = Fastify();

fastify.register(fastifyExpress).after(() => {
  fastify.get('/', proxy);
  fastify.get('/favicon.ico', (req, res) => res.status(204).end());
});

fastify.listen(PORT, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Listening on ${address}`);
});
