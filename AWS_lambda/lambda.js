// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
const uuid = require('uuid');
// Set the region 
AWS.config.update({ region: 'us-east-1' });

exports.handler = function (event, context, callback) {
  console.log("AWS lambda and SNS trigger ");
  console.log(event);
  const sns = event.Records[0].Sns.Message;
  console.log(sns)

  const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
  // const ses = new AWS.SES({ apiVersion: "2010-12-01" });

  var paramsGet = {
    TableName: 'csye6225',
    Key: {
      'id': { S: event.Records[0].Sns.Message }
    }
  };

  // Call DynamoDB to read the item from the table
  ddb.getItem(paramsGet, function (err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // can't find this email
      if (data.Item == undefined) {
        console.log("not-exist");
        var token = uuid.v4();
        var ExpirationTime = Math.floor(new Date().getTime() / 1000 + 900);
        var paramsPut = {
          TableName: 'csye6225',
          Item: {
            'id': { S: event.Records[0].Sns.Message },
            'ExpirationTime': { N: ExpirationTime.toString() },
            'token': { S: token },
          }
        };

        // Call DynamoDB to add the item to the table
        ddb.putItem(paramsPut, function (err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            console.log("Success add item: " + event.Records[0].Sns.Message);
            console.log("add send email here!");

            // Create email params
            const paramsEmail = {
              Destination: {
                ToAddresses: [
                  event.Records[0].Sns.Message
                ]
              },
              Message: {
                Body: {
                  Html: {
                    Charset: "UTF-8",
                    Data: `<html><body><p style='color:black;font-size:18px;'>Hello ${event.Records[0].Sns.Message}</p><p style='color:black;font-size:14px;'>We have received a request from this email address to reset your weisiminpeng’s webapp's Password for this email address. To reset your password, click on the secure link below (or copy and paste the below URL into your browser):</p><p style='color:blue;font-size:14px;'>https://prod.weisiminpeng.com/reset/reset?${event.Records[0].Sns.Message}&${token}</p><p style='color:black;font-size:14px;'>This link take you to a secure page to change your password. If you did not request a password rest, please ignore this email</p></body></html>`
                }
                },
                Subject: {
                  Charset: 'UTF-8',
                  Data: "Reset Your Weisimin Peng's webapp's Password"
                }
              },
              Source: 'no-reply@prod.weisiminpeng.com',
            };
            // Create the promise and SES service object
            const sendPromise = new AWS
              .SES({ apiVersion: '2010-12-01' })
              .sendEmail(paramsEmail)
              .promise();
            // Handle promise's fulfilled/rejected states
            sendPromise.then(data => {
              console.log(data.MessageId);
              console.log("send email successfully");
            }).catch(err => {
              console.error(err, err.stack);
            });

          }
        });
      } else {
        // within 15 minutes, do nothing
        console.log(data.Item);
        if (data.Item.ExpirationTime.N > Math.floor(new Date().getTime() / 1000)) {
          console.log("already send email within 15 minutes!")
        }
        // after 15 minutes, send agagin
        if (data.Item.ExpirationTime.N < Math.floor(new Date().getTime() / 1000)) {
          console.log("send email again because past 15 minutes!")
          console.log(data.Item);
          // create new token and save to dynamodb

          // Call DynamoDB to delete the item from the table
          ddb.deleteItem(paramsGet, function (err, data) {
            if (err) {
              console.log("Error", err);
            } else {
              console.log("Success delete expirable item: " + event.Records[0].Sns.Message);
            }
            var tokenAgain = uuid.v4();;
            var ExpirationTime = Math.floor(new Date().getTime() / 1000 + 900);
            var paramsPutAgain = {
              TableName: 'csye6225',
              Item: {
                'id': { S: event.Records[0].Sns.Message },
                'ExpirationTime': { N: ExpirationTime.toString() },
                'token': { S: tokenAgain },
              }
            };

            // Call DynamoDB to add the item to the table
            ddb.putItem(paramsPutAgain, function (err, data) {
              if (err) {
                console.log("Error", err);
              } else {
                console.log("Success add item " + event.Records[0].Sns.Message + " again");
              }
              console.log("add send email here!");

              // Create email params
              const paramsEmail = {
                Destination: {
                  ToAddresses: [
                    event.Records[0].Sns.Message
                  ]
                },
                Message: {
                  Body: {
                    Html: {
                      Charset: "UTF-8",
                      Data: `<html><body><p style='color:black;font-size:18px;'>Hello ${event.Records[0].Sns.Message}</p><p style='color:black;font-size:14px;'>We have received a request from this email address to reset your weisiminpeng’s webapp's Password for this email address. To reset your password, click on the secure link below (or copy and paste the below URL into your browser):</p><p style='color:blue;font-size:14px;'>https://prod.weisiminpeng.com/reset/reset?${event.Records[0].Sns.Message}&${tokenAgain}</p><p style='color:black;font-size:14px;'>This link take you to a secure page to change your password. If you did not request a password rest, please ignore this email</p></body></html>`
                  }
                  },
                  Subject: {
                    Charset: 'UTF-8',
                    Data: "Reset Your Weisimin Peng's webapp's Password"
                  }
                },
                Source: 'no-reply@prod.weisiminpeng.com',
              };
              // Create the promise and SES service object
              const sendPromise = new AWS
                .SES({ apiVersion: '2010-12-01' })
                .sendEmail(paramsEmail)
                .promise();
              // Handle promise's fulfilled/rejected states
              sendPromise.then(data => {
                console.log(data.MessageId);
                console.log("send email successfully");
              }).catch(err => {
                console.error(err, err.stack);
              });
            });
          });
        }
      }
    }
  });

  // var token = require('crypto').randomBytes(32).toString('hex');

  // var ExpirationTime = Math.floor(new Date().getTime() / 1000 + 900);
  // var params = {
  //   TableName: 'csye6225',
  //   Item: {
  //     'id': { S: event.Records[0].Sns.Message },
  //     'ExpirationTime': { N: ExpirationTime.toString() },
  //     'token': { S: token },
  //   }
  // };

  // // Call DynamoDB to add the item to the table
  // ddb.putItem(params, function (err, data) {
  //   if (err) {
  //     console.log("Error", err);
  //   } else {
  //     console.log("Success", data);
  //   }
  // });

  callback(null, sns);
};