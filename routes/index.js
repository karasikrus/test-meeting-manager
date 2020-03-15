const express = require('express');
const router = express.Router();

const pgp = require("pg-promise")();
let dbUrl;
try {
    dbUrl = require('./../config/dbConfig');
} catch (e) {
    console.log('no config file');
}
const db = pgp(dbUrl.postgresUrl);


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.delete('/meetings', function (req, res, next) {
    console.log(req.body);
    if(!req.body.id){
        res.status(400).send('incorrect format');
    }
    let id = req.body.id;
    db.result('DELETE FROM meeting WHERE id = $1', id)
        .then(data => {
            console.log(data.rowCount);
            if (data.rowCount>0){
                res.send('ok');
            } else{
                res.send('there is nothing to delete');
            }
        })
        .catch(error =>{
            console.log('error in deleting meeting from database: ', error);
        })
});

router.get('/meetings', function (req, res, next) {
    db.task(async t => {
        // t.ctx = task config + state context;
        let meetings = [];
        try {
            meetings = await t.any('SELECT * FROM meeting');
        } catch (e) {
            console.log('error in getting meetings from database: ', e);
        }
        let promises = [];
        for (let meeting of meetings) {
            promises.push(t.any(
                'SELECT * FROM person WHERE email IN (SELECT person_email FROM participants WHERE meeting_id = $1)',
                meeting.id))
        }
        promises.push(meetings);
        return Promise.all(promises);
    })
        .then(events => {
            let meetings = events.pop();
            for (let i = 0; i < meetings.length; i++) {
                meetings[i].participants = events[i];
            }
            res.send(meetings);
        })
        .catch(error => {
            console.log('error in getting participants from database: ', error)// error
        });
});

module.exports = router;
