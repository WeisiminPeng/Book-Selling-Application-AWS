const assert = require('assert');
// const request = require('request');


describe('Simple Math Test', () => {
 it('should return 2', () => {
        assert.equal(1 + 1, 2);
    });
 it('should return 9', () => {
        assert.equal(3 * 3, 9);
    });
});

// var expect  = require('chai').expect;
// var request = require('request');

// it('Test page content', function(done) {
//     request('http://localhost:3000' , function(error, response, body) {
//         expect(body).to.equal('webapp server test!');
//         done();
//     });
// });