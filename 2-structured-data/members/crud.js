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
 * GET /members/add
 *
 * Display a page of members (up to ten at a time).
 */
router.get('/', (req, res, next) => {
  getModel().list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      next(err);
      return;
    }
    res.render('members/list.jade', {
      members: entities,
      nextPageToken: cursor
    });
  });
});

/**
 * GET /members/add
 *
 * Display a form for creating a member.
 */
// [START add_get]
router.get('/add', (req, res) => {
  res.render('members/form.jade', {
    member: {},
    action: 'Add'
  });
});
// [END add_get]

/**
 * POST /members/add
 *
 * Create a member.
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
 * GET /members/:id/edit
 *
 * Display a member for editing.
 */
router.get('/:member/edit', (req, res, next) => {
  getModel().read(req.params.member, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('members/form.jade', {
      member: entity,
      action: 'Edit'
    });
  });
});

/**
 * POST /members/:id/edit
 *
 * Update a member.
 */
router.post('/:member/edit', (req, res, next) => {
  const data = req.body;

  getModel().update(req.params.member, data, (err, savedData) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  });
});

/**
 * GET /members/:id
 *
 * Display a member.
 */
router.get('/:member', (req, res, next) => {
  getModel().read(req.params.member, (err, entity) => {
    if (err) {
      next(err);
      return;
    }
    res.render('members/view.jade', {
      member: entity
    });
  });
});

/**
 * GET /members/:id/delete
 *
 * Delete a member.
 */
router.get('/:member/delete', (req, res, next) => {
  getModel().delete(req.params.member, (err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect(req.baseUrl);
  });
});

/**
 * Errors on "/members/*" routes.
 */
router.use((err, req, res, next) => {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});

module.exports = router;
