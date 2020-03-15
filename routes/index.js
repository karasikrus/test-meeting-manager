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
router.post('/meetings', function (req, res, next) {
    if (!req.body.name || !req.body.start_time || !req.body.end_time) {
        res.status(400).send('incorrect format');
    } else {
        let name = req.body.name;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        if (end_time < start_time) {
            res.status(400).send('end_time should not be less than start_time');
        } else {
            db.one(
                'INSERT INTO meeting(name, start_time, end_time) VALUES($1, to_timestamp($2 / 1000.0), to_timestamp($3 / 1000.0)) RETURNING id',
                [name, start_time, end_time])
                .then((data) => {
                    res.send(data);
                })
                .catch((error) => {
                    console.log('error in adding participant to database: ', error);
                })
        }
    }
});

router.post('/participants', function (req, res, next) {
    if (!req.body.meetingId || !req.body.email) {
        res.status(400).send('incorrect format');
    } else {
        let id = req.body.meetingId;
        let email = req.body.email;
        let name = req.body.name;
        db.task(async t => {
            let person = await t.oneOrNone('SELECT FROM person WHERE email = $1', email);
            if (!person) {
                try {
                    await t.oneOrNone('INSERT INTO person(name, email) VALUES($1, $2)', [name, email]);
                } catch (e) {
                    console.log('no name for new person: ', e);
                }
            }
            return t.oneOrNone('INSERT INTO participants(meeting_id, person_email) VALUES($1, $2)',
                [id, email]);

        })
            .then(() => {
                res.send('ok');
            })
            .catch((error) => {
                console.log('error in adding participant to database: ', error);
            })
    }
});


router.delete('/participants', function (req, res, next) {
    if (!req.body.email || !req.body.meetingId) {
        res.status(400).send('incorrect format');
    } else {
        let email = req.body.email;
        let id = req.body.meetingId;
        db.result('DELETE FROM participants WHERE meeting_id = $1 AND person_email = $2', [id, email])
            .then(data => {
                console.log(data.rowCount);
                if (data.rowCount > 0) {
                    res.send('ok');
                } else {
                    res.send('there is nothing to delete');
                }
            })
            .catch(error => {
                console.log('error in deleting participant from database: ', error);
            })
    }
});

router.delete('/meetings', function (req, res, next) {
    console.log(req.body);
    if (!req.body.id) {
        res.status(400).send('incorrect format');
    } else {
        let id = req.body.id;
        db.result('DELETE FROM meeting WHERE id = $1', id)
            .then(data => {
                console.log(data.rowCount);
                if (data.rowCount > 0) {
                    res.send('ok');
                } else {
                    res.send('there is nothing to delete');
                }
            })
            .catch(error => {
                console.log('error in deleting meeting from database: ', error);
            })
    }
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
