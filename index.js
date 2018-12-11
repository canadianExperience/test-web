var express = require("express");
var bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
var cors = require('cors');
const { check, validationResult } = require('express-validator/check');

//get from environment variable or port 8000
var PORT = process.env.PORT || 8000;
console.log('PORT=' + PORT);

var HOST = process.env.HOST || '127.0.0.1';
console.log('HOST=' + HOST);

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;

var server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

var url = process.env.MONGOLAB_URI_MEDICAL;
console.log('MONGOLAB_URI_MEDICAL=' + url);

//server.set("port", PORT);
server.set('port', PORT);

server.listen(server.get("port"), function () {
  console.log('Server %s listening at %s', HOST, PORT)
  console.log('Resources:')
  console.log(HOST + ':' + PORT + '/patients')
  console.log(HOST + ':' + PORT + '/doctors')
  console.log(HOST + ':' + PORT + '/records')
  console.log(HOST + ':' + PORT + '/records/:id')
  console.log(HOST + ':' + PORT + '/patients/:id')
  console.log(HOST + ':' + PORT + '/patients/:id/records')
  console.log(HOST + ':' + PORT + '/patients/:id/recordType/:recordType')
  console.log(HOST + ':' + PORT + '/patients/all')
  console.log(HOST + ':' + PORT + '/patients/critical')
})

// GET patients in critical conditions and their critical records
server.get('/patients/critical', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    dbo.collection("patients").aggregate([{
      $lookup: {
        from: 'records',
        localField: '_id',
        foreignField: 'patient_id',
        as: 'recorddetails'
      }
    },
    {
      $project:
      {
        recorddetails: {
          $filter: {
            input: '$recorddetails',
            as: 'item',
            cond: { $eq: ['$$item.isCritical', true] }
          }
        }
      }
    },
    { $match: { recorddetails: { $gt: [] } } }

    ]).toArray(function (err2, res2) {
        if (err2) throw err2;
        console.log(JSON.stringify(res2));
        res.status(200).send(res2);
        db.close();
      });
  })
});

//Get patients by doctor ID

server.get('/patients/doctor/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = 'patient_doctorID';
    var id = req.params.id;
    var value = id;
    var query = {};
    query[name] = value;
    console.log(query);
    dbo.collection("patients").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

//*Get all patients in the system

server.get('/patients', function (req, res, next) {
  console.log("GET!!!!!!!!!!!!!");
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) {
      console.log(err);
      throw err;
    }
    var dbo = db.db("medical-web");
    dbo.collection("patients").find().toArray(function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

//*Get all doctors in the system

server.get('/doctors', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    dbo.collection("doctors").find().toArray(function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

// Get a single patient by id

server.get('/patients/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var id = req.params.id;
    var value = new ObjectId(id);
    var query = {};
    query[name] = value;
    console.log(query);
    dbo.collection("patients").findOne(query, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

// Get a single doctor by id

server.get('/doctors/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var id = req.params.id;
    var value = new ObjectId(id);
    var query = {};
    query[name] = value;
    console.log(query);
    dbo.collection("doctors").findOne(query, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

//* Get patient's records by patient id

server.get('/patients/:id/records', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = 'patient_id';
    var id = req.params.id;
    var value = new ObjectId(id);
    var query = {};
    query[name] = value;
    dbo.collection("records").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})

//* Get doctor login page

server.get('/login/:doctor_login/:doctor_password', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name_login = 'doctor_login';
    var name_password = 'doctor_password';
    var value_login = req.params.doctor_login;
    var value_password = req.params.doctor_password;
    var query = {};
    query[name_login] = value_login;
    query[name_password] = value_password;
    dbo.collection("doctors").findOne(query, function (err, result) {
      if (err) throw err;
      if (result==null) {
        res.status(400).send({'result':'fail'});
      } else {
        res.status(200).send(result);
      }
      db.close();
    });
  })
})

//Get all records in the system

server.get('/records', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    dbo.collection("records").find().toArray(function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      res.status(200).send(result);
      db.close();
    });
  })
})


//* POST - create new record for a patient by patient id and record type

server.post('/patients/:id/recordType/:recordType',
  [
    check('recordValue').isLength({ min: 2 }).withMessage('recordValue must be at least 2 chars long'),
    check('recordUom').isLength({ min: 2 }).withMessage('recordUom must be at least 2 chars long')
  ],
  function (req, res, next) {
    console.log("START POST RECORD__________________________");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(406).json({ errors: errors.array() });
    }
    var isCritical = getCritical(req.params.recordType, req.body.recordValue);
    var recordDate = new Date().toISOString();
    var recordType = decodeURI(req.params.recordType);
    console.log(recordType);
    console.log(recordDate);
    var newRecord = {
      patient_id: ObjectId(req.params.id),
      recordType: recordType,
      recordValue: req.body.recordValue,
      recordUom: req.body.recordUom,
      isCritical: Boolean(isCritical),
      recordDate: recordDate
    }
    console.log("------------------------- " + isCritical);
    var newRecordJSON = JSON.stringify(newRecord);
    console.log(newRecordJSON);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) 
      {
        console.log(err);
        throw err;
      }
      var dbo = db.db("medical-web");
      dbo.collection("records").insertOne(newRecord, function (err, res2) {
        if (err) 
        {
          console.log(err);
          throw err;
        }
        console.log("record inserted");
        console.log(JSON.stringify(res2));
        var name1 = 'patient_id';
        var value1 = ObjectId(req.params.id);
        var name2 = 'recordType';
        var value2 = req.params.recordType;
        var name3 = 'recordUom';
        var value3 = req.body.recordUom;
        var name4 = 'isCritical';
        var value4 = Boolean(isCritical);
        var name5 = 'recordDate';
        var value5 = recordDate;
        var query = {};
        query[name1] = value1;
        query[name2] = value2;
        query[name3] = value3;
        query[name4] = value4;
        query[name5] = value5;
        dbo.collection("records").findOne(query, function (err, result) {
          if (err) 
          {
            console.log(err);
            throw err;
          }
          console.log(JSON.stringify(newRecord));
          res.status(201).send(newRecord);
          db.close();
        });
      });
    })
  });

//* POST - create a new patient

server.post('/patients',
  [
    check('patient_firstName').isAlpha().isLength({ min: 2 }).withMessage('patient_firstName must be at least 2 chars long and contain letters only'),
    check('patient_lastName').isAlpha().isLength({ min: 2 }).withMessage('patient_lastName must be at least 2 chars long and contain letters only'),
    check('patient_dateOfBirth').isISO8601().withMessage('patient_dateOfBirth must be in date format YYYY-MM-DD'),
    check('patient_gender').isIn(['male', 'female']).withMessage('patient_gender must be male or female'),
    check('patient_address').isLength({ min: 2 }).withMessage('patient_address must be at least 2 chars long'),
    check('patient_city').isAlpha().isLength({ min: 2 }).withMessage('patient_city must be at least 2 chars long and contain letters only'),
    check('patient_province').isAlpha().isLength({ min: 2 }).withMessage('patient_province must be at least 2 chars long and contain letters only'),
    check('patient_postalCode').matches(/^[A-Za-z][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$/).withMessage('patient_postalCode must be provided'),
    check('patient_e_mail').isLength({ min: 2 }).withMessage('patient_e_mail must be at least 2 chars long'),
    check('patient_phoneNumber').isLength({ min: 2 }).withMessage('patient_phoneNumber must be at least 2 chars long'),
    check('patient_doctorID').isLength({ min: 2 }).withMessage('patient_doctorID must be at least 2 chars long'),
  ],
  function (req, res, next) {
    console.log(req.body.patient_gender);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(406).json({ errors: errors.array() });
    }
    var newPatient = {
      photo: req.body.photo,
      patient_firstName: req.body.patient_firstName,
      patient_lastName: req.body.patient_lastName,
      patient_dateOfBirth: req.body.patient_dateOfBirth,
      patient_gender: req.body.patient_gender,
      patient_address: req.body.patient_address,
      patient_city: req.body.patient_city,
      patient_province: req.body.patient_province,
      patient_postalCode: req.body.patient_postalCode,
      patient_e_mail: req.body.patient_e_mail,
      patient_phoneNumber: req.body.patient_phoneNumber,
      patient_doctorID: req.body.patient_doctorID,
      patient_isCritical: req.body.patient_isCritical
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("medical-web");
      dbo.collection("patients").insertOne(newPatient, function (err, res2) {
        if (err) throw err;
        console.log(JSON.stringify(newPatient));
        res.status(201).send(newPatient);
        db.close();
      });
    })
  })

  //* POST - create a new doctor

server.post('/doctors',
[
  check('doctor_firstName').isAlpha().isLength({ min: 2 }).withMessage('doctor_firstName must be at least 2 chars long and contain letters only'),
  check('doctor_lastName').isAlpha().isLength({ min: 2 }).withMessage('doctor_lastName must be at least 2 chars long and contain letters only'),
  //check('doctor_occupation').isAlpha().isLength({ min: 2 }).withMessage('doctor_occupation must be at least 2 chars long and contain letters only'),
  check('doctor_e_mail').isLength({ min: 2 }).withMessage('doctor_e_mail must be at least 2 chars long'),
  check('doctor_phoneNumber').isLength({ min: 2 }).withMessage('doctor_phoneNumber must be at least 2 chars long'),
  check('doctor_laboratoryName').isLength({ min: 2 }).withMessage('doctor_laboratoryName must be at least 2 chars long'),
  check('doctor_login').isLength({ min: 2 }).withMessage('doctor_login must be at least 2 chars long'),
  check('doctor_password').isLength({ min: 2 }).withMessage('doctor_password must be at least 2 chars long')
],
function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(406).json({ errors: errors.array() });
  }
  var newDoctor = {
    photo: req.body.photo,
    doctor_firstName: req.body.doctor_firstName,
    doctor_lastName: req.body.doctor_lastName,
    doctor_occupation: req.body.doctor_occupation,
    doctor_e_mail: req.body.doctor_e_mail, 
    doctor_phoneNumber: req.body.doctor_phoneNumber,
    doctor_laboratoryName: req.body.doctor_laboratoryName,
    doctor_login: req.body.doctor_login,
    doctor_password:req.body.doctor_password
  }
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) 
    {
      console.log(err);
      throw err;
    }
    var dbo = db.db("medical-web");

console.log(newDoctor.doctor_login);
    dbo.collection("doctors").findOne({doctor_login: newDoctor.doctor_login}, function (err, result) {
      if (err) 
      {
        console.log(err);
        throw err;
      }
      if(result != null){
        res.status(400).send({'result':'Doctor login already exists'});
        db.close();
        return;
      }
      dbo.collection("doctors").insertOne(newDoctor, function (err, res2) {
        if (err) throw err;
        console.log(JSON.stringify(newDoctor));
        res.status(201).send(newDoctor);
        db.close();
      });
    });
  })
})

// Delete all patients and their records

server.delete('/patients/all', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    dbo.collection("patients").deleteMany({}, function (err, res2) {
      if (err) throw err;
      console.log("patients deleted");
      dbo.collection("records").deleteMany({}, function (err, res3) {
        if (err) throw err;
        console.log("records deleted");
        //res.status(201).send("deleted");
        res.status(200).send({'result':'deleted'});
        db.close();
      });
    });
  })
})

// Delete all doctors

server.delete('/doctors/all', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
      dbo.collection("doctors").deleteMany({}, function (err, res3) {
        if (err) throw err;
        console.log("doctors deleted");
        //res.status(201).send("deleted");
        res.status(200).send({'result':'deleted'});
        db.close();
      });
  })
})

// Delete patient's records by patient id and record type
// Ex: Delete all Blood Pressure or all Respiratory Rate

server.delete('/patients/:id/recordType/:recordType', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name1 = 'patient_id';
    var value1 = ObjectId(req.params.id);
    var name2 = 'recordType';
    var value2 = req.params.recordType;
    var query = {};
    query[name1] = value1;
    query[name2] = value2;
    dbo.collection("records").deleteMany(query, function (err, res2) {
      if (err) throw err;
      console.log("record deleted");
      //res.status(201).send("deleted");
      res.status(200).send({'result':'deleted'});
      db.close();
    });
  })
})

//Delete a single patient by patient id and all their records

server.delete('/patients/:id/patient/records', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var value = ObjectId(req.params.id);
    var query = {};
    query[name] = value;
    dbo.collection("patients").deleteOne(query, function (err, res2) {
      if (err) throw err;
      console.log("patient deleted");
      var name = 'patient_id';
      var value = ObjectId(req.params.id);
      var query = {};
      query[name] = value;
      dbo.collection("records").deleteMany(query, function (err, res2) {
        if (err) throw err;
        console.log("records deleted");
        //res.set('Content-Type', 'text/plain');
        //res.status(200).send("deleted");
        res.status(200).send({'result':'deleted'});
        db.close();
      });
    });
  })
})

//Delete a single patient by patient id

server.delete('/patients/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var value = ObjectId(req.params.id);
    var query = {};
    query[name] = value;
    dbo.collection("patients").deleteOne(query, function (err, res2) {
      if (err) throw err;
      console.log("patient deleted");
      //res.set('Content-Type', 'text/plain');
      res.status(200).send({'result':'deleted'});
      //res.status(200).send("deleted");
      db.close();
    });
  })
})

//Delete a single doctor by doctor id

server.delete('/doctors/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var value = ObjectId(req.params.id);
    var query = {};
    query[name] = value;
    dbo.collection("doctors").deleteOne(query, function (err, res2) {
      if (err) throw err;
      console.log("doctor deleted");
      //res.set('Content-Type', 'text/plain');
      res.status(200).send({'result':'deleted'});
      //res.status(200).send("deleted");
      db.close();
    });
  })
})

//Delete patient's records by patient id

server.delete('/patients/:id/records', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = 'patient_id';
    var value = ObjectId(req.params.id);
    var query = {};
    query[name] = value;
    dbo.collection("records").deleteMany(query, function (err, res2) {
      if (err) throw err;
      console.log("records deleted");
      res.set('Content-Type', 'text/plain');
      //res.status(200).send("deleted");
      res.status(200).send({'result':'deleted'});
      db.close();
    });
  })
})

//Delete a single record by record id 

server.delete('/records/:id', function (req, res, next) {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db("medical-web");
    var name = '_id';
    var value = ObjectId(req.params.id);
    var query = {};
    query[name] = value;
    console.log(JSON.stringify(query));
    dbo.collection("records").deleteOne(query, function (err, res2) {
      if (err) throw err;
      console.log("record deleted");
      res.status(200).send({'result':'deleted'});
      db.close();
    });
  })
})

// Update a patient by their id

//Set patient isCritical
server.put('/patients/:id/:isCritical',
  function (req, res, next) {
    console.log("START PUT RECORD__________________________");
    var isCritical = req.params.isCritical;
    var newPatient = {
      patient_id: ObjectId(req.params.id),
      isCritical: isCritical
    }
    console.log("------------------------- " + isCritical);
    var newPatientJSON = JSON.stringify(newPatient);
    console.log(newPatientJSON);
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) 
      {
        console.log(err);
        throw err;
      }
      var dbo = db.db("medical-web");
      var myquery = { _id: ObjectId(req.params.id) };
      var newPatient_updated = { $set: newPatient };
      dbo.collection("patients").updateOne(myquery, newPatient_updated, function (err, res2) {
        if (err) throw err;
        console.log("patient updated");
        console.log(JSON.stringify(newPatient));
        res2.status(200).send({'result':'updated'});
        db.close();
      });
  });
})


server.put('/patients/:id',
[
  check('patient_firstName').isAlpha().isLength({ min: 2 }).withMessage('patient_firstName must be at least 2 chars long and contain letters only'),
  check('patient_lastName').isAlpha().isLength({ min: 2 }).withMessage('patient_lastName must be at least 2 chars long and contain letters only'),
  check('patient_dateOfBirth').isISO8601().withMessage('patient_dateOfBirth must be in date format YYYY-MM-DD'),
  check('patient_gender').isIn(['male', 'female']).withMessage('patient_gender must be male or female'),
  check('patient_address').isLength({ min: 2 }).withMessage('patient_address must be at least 2 chars long'),
  check('patient_city').isAlpha().isLength({ min: 2 }).withMessage('patient_city must be at least 2 chars long and contain letters only'),
  check('patient_province').isAlpha().isLength({ min: 2 }).withMessage('patient_province must be at least 2 chars long and contain letters only'),
  check('patient_postalCode').matches(/^[A-Za-z][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$/).withMessage('patient_postalCode must be provided'),
  check('patient_e_mail').isLength({ min: 2 }).withMessage('patient_e_mail must be at least 2 chars long'),
  check('patient_phoneNumber').isLength({ min: 2 }).withMessage('patient_phoneNumber must be at least 2 chars long'),
  check('patient_doctorID').isLength({ min: 2 }).withMessage('patient_doctorID must be at least 2 chars long'),
],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(406).json({ errors: errors.array() });
    }
    var newPatient = {
      photo: req.body.photo,
      patient_firstName: req.body.patient_firstName,
      patient_lastName: req.body.patient_lastName,
      patient_dateOfBirth: req.body.patient_dateOfBirth,
      patient_gender: req.body.patient_gender,
      patient_address: req.body.patient_address,
      patient_city: req.body.patient_city,
      patient_province: req.body.patient_province,
      patient_postalCode: req.body.patient_postalCode,
      patient_e_mail: req.body.patient_e_mail,
      patient_phoneNumber: req.body.patient_phoneNumber,
      patient_doctorID: req.body.patient_doctorID
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("medical-web");
      var myquery = { _id: ObjectId(req.params.id) };
      var newPatient_updated = { $set: newPatient };
      dbo.collection("patients").updateOne(myquery, newPatient_updated, function (err, res2) {
        if (err) throw err;
        console.log("patient updated");
        console.log(JSON.stringify(newPatient));
        res.status(201).send(newPatient);
        db.close();
      });
    })
  })

// Update a record by record id

server.put('/records/:id',
  [
    check('patient_id').isLength({ min: 2 }).withMessage('patient id must be at least 2 chars long'),
    check('recordType').isLength({ min: 2 }).withMessage('recordType must be at least 2 chars long'),
    check('recordValue').isLength({ min: 2 }).withMessage('recordValue must be at least 2 chars long'),
    check('recordUom').isLength({ min: 2 }).withMessage('recordUom must be at least 2 chars long')
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(406).json({ errors: errors.array() });
    }
    var isCritical = getCritical(req.body.recordType, req.body.recordValue);
    var newRecord = {
      patient_id: ObjectId(req.body.patient_id),
      recordType: req.body.recordType,
      recordValue: req.body.recordValue,
      recordUom: req.body.recordUom,
      isCritical: Boolean(isCritical)
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db("medical-web");
      var myquery = { _id: ObjectId(req.params.id) };
      var newRecord_updated = { $set: newRecord };
      dbo.collection("records").updateOne(myquery, newRecord_updated, function (err, res2) {
        if (err) throw err;
        console.log("record updated");
        console.log(JSON.stringify(newRecord));
        res.status(201).send(newRecord);
        db.close();
      });
    })
  })


  server.put('/doctors/:id',
[
  check('doctor_firstName').isAlpha().isLength({ min: 2 }).withMessage('doctor_firstName must be at least 2 chars long and contain letters only'),
  check('doctor_lastName').isAlpha().isLength({ min: 2 }).withMessage('doctor_lastName must be at least 2 chars long and contain letters only'),
  //check('doctor_occupation').isAlpha().isLength({ min: 2 }).withMessage('doctor_occupation must be at least 2 chars long and contain letters only'),
  check('doctor_e_mail').isLength({ min: 2 }).withMessage('doctor_e_mail must be at least 2 chars long'),
  check('doctor_phoneNumber').isLength({ min: 2 }).withMessage('doctor_phoneNumber must be at least 2 chars long'),
  check('doctor_laboratoryName').isLength({ min: 2 }).withMessage('doctor_laboratoryName must be at least 2 chars long'),
  check('doctor_login').isLength({ min: 2 }).withMessage('doctor_login must be at least 2 chars long'),
  check('doctor_password').isLength({ min: 2 }).withMessage('doctor_password must be at least 2 chars long')
],
function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(406).json({ errors: errors.array() });
  }
  var newDoctor = {
    photo: req.body.photo,
    doctor_firstName: req.body.doctor_firstName,
    doctor_lastName: req.body.doctor_lastName,
    doctor_occupation: req.body.doctor_occupation,
    doctor_e_mail: req.body.doctor_e_mail, 
    doctor_phoneNumber: req.body.doctor_phoneNumber,
    doctor_laboratoryName: req.body.doctor_laboratoryName,
    doctor_login: req.body.doctor_login,
    doctor_password:req.body.doctor_password
  }
  var myquery = { _id: ObjectId(req.params.id) };
  var newDoctor_updated = { $set: newDoctor };
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) 
    {
      console.log(err);
      throw err;
    }
    var dbo = db.db("medical-web");

console.log(newDoctor.doctor_login);
      dbo.collection("doctors").updateOne(myquery, newDoctor_updated, function (err, res2) {
        if (err) throw err;
        console.log(JSON.stringify(newDoctor));
        res.status(201).send(newDoctor);
        db.close();
      });
  })
})

function getCritical(recordType, recordValue) {
  console.log(recordType);
  var rValue = parseInt(recordValue);
  switch (recordType.toLowerCase()) {
    case "heigh blood pressure":
      if (rValue <= 120 && rValue > 110) {
        return false;
      } else { return true; }
      break;
    case "low blood pressure":
      if (rValue <= 80 && rValue > 70) {
        return false;
      } else { return true; }
      break;
    case "respiratory rate":
      if (rValue <= 16 && rValue >= 12) {
        return false;
      } else { return true; }
      break;
    case "blood oxygen level":
      if (rValue <= 100 && rValue >= 75) {
        return false;
      } else { return true; }
      break;
    case "heart beat rate":
      if (rValue <= 100 && rValue >= 60) {
        return false;
      } else { return true; }
      break;
    default:
      return true;
  }
}





