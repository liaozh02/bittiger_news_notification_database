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
 * GET /groups/add
 *
 * Display a page of groups (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('groups/list.jade', {
      groups: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /groups/add
 *
 * Display a form for creating a group.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('groups/form.jade', {
    group: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /groups/add
 *
 * Create a group.
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
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});
// [END add_post]

/**
 * GET /groups/:id/edit
 *
 * Display a group for editing.
 */
router.get('/:group/edit', (req, res, next) => {
  getModel().read(req.params.group, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('groups/form.jade', {
      group: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /groups/:id/edit
 *
 * Update a group.
 */
router.post('/:group/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.group, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /groups/:id
 *
 * Display a group.
 */
router.get('/:group', (req, res, next) => {
  getModel().read(req.params.group, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('groups/view.jade', {
      group: entity
    });
  });
});

/**
 * GET /groups/:id/delete
 *
 * Delete a group.
 */
router.get('/:group/delete', (req, res, next) => {
  getModel().delete(req.params.group, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/groups/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
