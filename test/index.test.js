var app = require("../index");
const chai = require('chai');
var expect = chai.expect;
const should = chai.should();
var chaiHttp = require("chai-http");
var sinon = require("sinon"); //stubbing, get responce from stub instead of server 
const request = require('request');
//Use to compare objects
const transform = require('lodash').transform;
const isEqual = require('lodash').isEqual;
const isObject = require('lodash').isObject;

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
	return transform(object, (result, value, key) => {
		if (!isEqual(value, base[key])) {
			result[key] = isObject(value) && isObject(base[key]) ? difference(value, base[key]) : value;
		}
	});
}

// describe("index", function() {
//     describe("/patients GET", function() {
//     });
// });


//Test example
// function Person(givenName, familyName) {
//     this.givenName = givenName;
//     this.familyName = familyName;
//   }
  
//   Person.prototype.getFullName = function() {
//     return `${this.givenName} ${this.familyName}`;
//   };
  
//   describe('Sample Sinon Stub Take 2', () => {
//     it('should pass', (done) => {
//       const name = new Person('Michael', 'Herman');
//       console.log("\nname.getFullName()=", name.getFullName());
//       name.getFullName().should.eql('Michael Herman');
//       sinon.stub(Person.prototype, 'getFullName').returns('John Doe');
//       name.getFullName().should.eql('John Doe');
//       done();
//     });
//   });


//=============
const base = 'https://elena-mohsena-group-project.herokuapp.com';

describe('patients_api', () => {

  describe('Integration test [not stubbed]', () => {
    // test cases

    describe('GET /patients/:id', () => {
        it('Status code should be 200', (done) => {
            request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {
                // there should be a 200 status code
                res.statusCode.should.eql(200);
                done();
            });
        });

        it('Content type should be application/json', (done) => {
            request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {

                // the response should be JSON
                res.headers['content-type'].should.contain('application/json');
                done();
            });
        });

        it('Content type should return proper response', (done) => {
            request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {
              
                // parse response body
                body = JSON.parse(body);
                var patient = require('./fixtures/patient_5bfd8bd07e404014844f083c.json');
                body.should.eql(patient);
                done();
            });
        });

      });

  });


  var responseObject, responseBody;

  describe('Unit test [stubbed]', () => {
    //Set stubb
    beforeEach(() => {
      responseObject = {
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        }
      };
      responseBody = 
        {
          "_id":"5bfd8bd07e404014844f083c",
          "patient_firstName":"Sara",
          "patient_lastName":"Carr",
          "patient_dateOfBirth":"1970-04-12",
          "patient_gender":"female",
          "patient_address":"825 Coxwell Ave, East York",
          "patient_city":"Toronto",
          "patient_province":"ON",
          "patient_postalCode":"M4C 3E7",
          "patient_e_mail":"test3@gmail.com",
          "patient_phoneNumber":"65432-87-43",
          "patient_doctorID":"5bfd6455312f7508ae722a11"
      }
        this.get = sinon.stub(request, 'get');
    });
  // After each test restore req , 
    afterEach(() => {
      request.get.restore();
    });

    describe('GET /patients/:id', () => {
      it('Status code should be 200', (done) => {
        this.get.yields(null, responseObject, JSON.stringify(responseBody));
        request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {
          // there should be a 200 status code
          res.statusCode.should.eql(200);
          done();
        });
      });
    });

    describe('GET /patients/:id', () => {
        it('Content type should be application/json', (done) => {
          this.get.yields(null, responseObject, JSON.stringify(responseBody));
          request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {
            // the response should be JSON
            res.headers['content-type'].should.contain('application/json');
            done();
          });
        });
      });

      describe('GET /patients/:id', () => {
        it('Content type should return proper response', (done) => {
          this.get.yields(null, responseObject, JSON.stringify(responseBody));
          request.get(`${base}/patients/5bfd8bd07e404014844f083c`, (err, res, body) => {
            // parse response body
            var patient = require('./fixtures/patient_5bfd8bd07e404014844f083c.json');
            body = JSON.parse(body);
            body.should.eql(patient);
            done();
          });
        });
      });

  });
});