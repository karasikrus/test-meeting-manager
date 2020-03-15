let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../bin/www');
let should = chai.should();

chai.use(chaiHttp);

describe('Get meetings, create meeting, then delete it', () => {

    //Precondition: 4 rows in "meeting" table
    describe('/GET meetings', () => {
        it('it should GET all meetings', (done) => {
            chai.request(server)
                .get('/meetings')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body[0].should.have.property("participants");
                    res.body[0].participants.should.be.a('array');
                    res.body.length.should.be.eql(4);
                    done();
                });
        });
    });
    describe('/POST meetings', () => {
        it('it should not create a meeting', (done) => {
            let meeting = {
                "name": "test one",
                "start_time": "2584293669720",
                "end_time": "1584303669720"
            };
            chai.request(server)
                .post('/meetings')
                .send(meeting)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.be.eql("end_time should not be less than start_time");
                    done();
                });
        });
        let id;
        it('it should create a meeting', (done) => {
            let meeting = {
                "name": "test one",
                "start_time": "1584293669720",
                "end_time": "1584303669720"
            };
            chai.request(server)
                .post('/meetings')
                .send(meeting)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("id");
                    id = res.body.id;
                    done();
                });
        });
        after((done) => {
            let deleteObject = {
                "id": id
            };
            chai.request(server)
                .delete('/meetings')
                .send(deleteObject)
                .end((err, res) => {
                    done();
                });
        });
    });
    describe('/DELETE meetings', () => {
        let id;
        before((done) => {
            let meeting = {
                "name": "test one",
                "start_time": "1584293669720",
                "end_time": "1584303669720"
            };
            chai.request(server)
                .post('/meetings')
                .send(meeting)
                .end((err, res) => {
                    id = res.body.id;
                    done();
                });
        });

        it('it should DELETE the meeting', (done) => {
            let deleteObject = {
                "id": id
            };
            chai.request(server)
                .delete('/meetings')
                .send(deleteObject)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.be.eql("ok");
                    done();
                });
        });
    });


});
