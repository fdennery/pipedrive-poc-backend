var express = require('express');
var router = express.Router();
const User = require('../models/users');

router.get('/session', (req,res)=> {
  console.log(req.session.id)
  res.json(req.session);
})



/* GET users */
router.get('/pipedrive/me', (req, res) => {  
  console.log(req.session)
  fetch(`${req.session.apiDomain}/v1/users/me`,{
    headers:{ 'Authorization': `Bearer ${req.session.pipedriveAccessToken}`}
  }).then(response => response.json())
    .then(apiData => {
    res.json({result: true, userData: apiData.data})
  })

})
module.exports = router;