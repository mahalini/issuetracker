const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testId1; // Store ID for later tests
  let testId2; // Store ID for later tests
  
  suite('POST /api/issues/{project} => object with issue data', function() {
    
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.equal(res.body.open, true);
          testId1 = res.body._id;
          done();
        });
    });
    
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields only'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Required fields only');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.equal(res.body.open, true);
          testId2 = res.body._id;
          done();
        });
    });
    
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'required field(s) missing');
          done();
        });
    });
    
  });
  
  suite('GET /api/issues/{project} => Array of objects with issue data', function() {
    
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
    });
    
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test?open=true')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.open, true);
          });
          done();
        });
    });
    
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/test?open=true&created_by=Functional Test - Every field filled in')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          res.body.forEach(issue => {
            assert.equal(issue.open, true);
            assert.equal(issue.created_by, 'Functional Test - Every field filled in');
          });
          done();
        });
    });
    
  });
  
  suite('PUT /api/issues/{project} => text', function() {
    
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId1,
          issue_text: 'updated text'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId1);
          done();
        });
    });
    
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId1,
          issue_title: 'Updated Title',
          issue_text: 'Updated text'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully updated');
          assert.equal(res.body._id, testId1);
          done();
        });
    });
    
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          issue_title: 'Updated Title'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testId1
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'no update field(s) sent');
          assert.equal(res.body._id, testId1);
          done();
        });
    });
    
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
      chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: 'invalid_id_12345',
          issue_title: 'Updated Title'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not update');
          assert.equal(res.body._id, 'invalid_id_12345');
          done();
        });
    });
    
  });
  
  suite('DELETE /api/issues/{project} => text', function() {
    
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: testId2
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.result, 'successfully deleted');
          assert.equal(res.body._id, testId2);
          done();
        });
    });
    
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: 'invalid_id_12345'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'could not delete');
          assert.equal(res.body._id, 'invalid_id_12345');
          done();
        });
    });
    
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });
    
  });

});
