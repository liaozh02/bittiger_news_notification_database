// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');

function getModel () {
  return require(`./model-${require('../config').get('DATA_BACKEND')}`);
}

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({ extended: false }));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /users
 *
 * Display a page of users (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/list.jade', {
      users: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /users/add
 *
 * Display a form for creating a user.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('users/form.jade', {
    user: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /users/add
 *
 * Create a user.
 */
// [START add_post]
router.post('/add', (req, res, next) => {
  const data = req.body;

  // Save the data to the database.
  getModel().create(data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.email}`);
  });
});
// [END add_post]

/**
 * GET /users/:email/edit
 *
 * Display a user for editing.
 */
router.get('/:user/edit', (req, res, next) => {
  getModel().read(req.params.user, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/form.jade', {
      user: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /users/:email/edit
 *
 * Update a user.
 */
router.post('/:user/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.user, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.email}`);
  });
});

/**
 * GET /users/:email
 *
 * Display a user.
 */
router.get('/:user', (req, res, next) => {
  getModel().read(req.params.user, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('users/view.jade', {
      user: entity
    });
  });
});

/**
 * GET /users/:email/delete
 *
 * Delete a user.
 */
router.get('/:user/delete', (req, res, next) => {
  getModel().delete(req.params.user, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/users/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
