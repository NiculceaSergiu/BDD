const express = require('express');
const { listAll, listSingle, insertNumber } = require('../controllers/numbersController');

const router = express.Router();

module.exports = (pools) => {
  router.get('/', listAll(pools));
  router.get('/:db', listSingle(pools));
  router.post('/', insertNumber(pools));
  return router;
};
