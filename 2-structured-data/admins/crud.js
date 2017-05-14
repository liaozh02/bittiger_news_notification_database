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
 * GET /admins/add
 *
 * Display a page of admins (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('admins/list.jade', {
      admins: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /admins/add
 *
 * Display a form for creating a admin.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('admins/form.jade', {
    admin: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /admins/add
 *
 * Create a admin.
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
 * GET /admins/:id/edit
 *
 * Display a admin for editing.
 */
router.get('/:admin/edit', (req, res, next) => {
  getModel().read(req.params.admin, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('admins/form.jade', {
      admin: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /admins/:id/edit
 *
 * Update a admin.
 */
router.post('/:admin/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.admin, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /admins/:id
 *
 * Display a admin.
 */
router.get('/:admin', (req, res, next) => {
  getModel().read(req.params.admin, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('admins/view.jade', {
      admin: entity
    });
  });
});

/**
 * GET /admins/:id/delete
 *
 * Delete a admin.
 */
router.get('/:admin/delete', (req, res, next) => {
  getModel().delete(req.params.admin, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/admins/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
