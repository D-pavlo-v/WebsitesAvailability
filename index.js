'use strict';

const express = require('express');
const axios = require("axios");
const nodemailer = require('nodemailer');
const { Datastore } = require('@google-cloud/datastore');
require('dotenv').config()

const app = express();

const URLS_TO_CHECK = [
    'https://vagonmaster.com/',
]

const SENDER = 'd.pavlov@dunice.net';

// IBS Dunice recepients...
const RECIPIENTS = [
  'glupiymozg1234567890@gmail.com',
  'a.muraviov@dunice.net',
  'mikhail@dunice.net',
];

const SERVICE = 'gmail';


const { env } = process;
const { MAIL_PASS } = env;

const datastore = new Datastore();
const mailTransporter = nodemailer.createTransport({
  service: SERVICE,
  auth: {
    user: SENDER,
    pass: MAIL_PASS,
  },
});

const insertVisit = (visit) => {
  return datastore.save({
    key: datastore.key('visit'),
    data: visit,
  });
};

const getVisits = () => {
  const query = datastore
    .createQuery('visit')
    .order('timestamp', { descending: true })
    .limit(100);

  return datastore.runQuery(query);
};

const reportError = (error, service) => {

  const mailOptions = RECIPIENTS.map((recepient) => {
    return {
      from: SENDER,
      to: recepient,
      subject: `${service} упал :(`,
      text: `Ошибка: \n${error}`
    }
  });

  mailOptions.forEach((option) => {
    mailTransporter.sendMail(option, (error, info) => {
      if (error) {
        console.error(error)
      } else {
        console.info('Email sent: ' + info.response)
      }
    })
  })

  mailTransporter.sendMail()
}

app.get('/', async (req, res, next) => {
  try {
    const [entities] = await getVisits();
    const visits = entities.map(
      (entity) => `Time: ${entity.timestamp}, Response Time: ${entity.responseDuration}ms, Successful: ${entity.successful}`
    );
    res
      .status(200)
      .set('Content-Type', 'text/plain')
      .send(`Last 100 checks:\n${visits.join('\n')}`)
      .end();
  } catch (error) {
    next(error);
  }
});

app.get('/test', async (req, response, next) => {
  axios.interceptors.request.use(function (config) {
    config.metadata = { startTime: new Date() }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });

  axios.interceptors.response.use(function (response) {
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    return response;
  }, function (error) {
    return Promise.reject(error);
  });

  let visit = {}

  URLS_TO_CHECK.forEach((url) => {
    axios.get(url)
        .then((response) => {
          visit = {
            timestamp: new Date(),
            responseDuration: response?.duration,
            successful: true
          };
        })
        .catch((error) => {
          visit = {
            timestamp: new Date(),
            successful: false
          };
          console.error(error);
          reportError(error, url);
        })
        .then(async function () {
          // always executed
          try {
            await insertVisit(visit);
          } catch (error) {
            next(error);
          }

          response.status(200).send(visit).end();
        });
    })
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`);
  console.info('Press Ctrl+C to quit.');
});

module.exports = app;