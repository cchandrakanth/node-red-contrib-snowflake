var snowflake = require('snowflake-sdk');
var connection = snowflake.createConnection({
  account: 'axcessfinancial.us-east-1',
  username: 'QA_ROBOT_UPDATER',
  password: 'fu8TsH74d7eWT'
});

connection.connect(function(err, conn) {
  if (err) {
    console.error('Unable to connect: ' , err.message);
  } else {
    console.log('Successfully connected as id: ' , connection.isUp());
  }
});

/*connection.destroy(function(err, conn) {
  if (err) {
    console.error('Unable to connect: ' , err.message);
  } else {
    console.log('Successfully connected as id: ' , connection.isUp());
  }
});*/

connection.execute({
  sqlText:'USE warehouse QA_ROBOT_XS_WH;',
  complete: function(err, stmt, rows) {
    if (err) {
      console.log('Failed to execute statement due to the following error: ' , err.message)
    } else {
      console.log('Successfully executed statement')
    }
  }
});

connection.execute({
  sqlText:'USE ROLE QA_ROBOT_UPDATER;USE DATABASE QA_ROBOT_DB;USE QA_ROBOT_DB.INFORMATION_SCHEMA;',
  complete: function(err, stmt) {
    if (err) {
      console.log('Failed to execute statement due to the following error: ', err.message)
    } else {
      console.log('Successfully executed statement: ' , stmt.getSqlText())
    }
  }
});

connection.execute({
  sqlText:'USE DATABASE QA_ROBOT_DB;',
  complete: function(err, stmt) {
    if (err) {
      console.log('Failed to execute statement due to the following error: ', err.message)
    } else {
      console.log('Successfully executed statement: ' , stmt.getSqlText())
    }
  }
});

connection.execute({
  sqlText:'USE QA_ROBOT_DB.INFORMATION_SCHEMA;',
  complete: function(err, stmt) {
    if (err) {
      console.log('Failed to execute statement due to the following error: ', err.message)
    } else {
      console.log('Successfully executed statement: ' , stmt.getSqlText())
    }
  }
});

var statement = `SELECT * FROM COLUMNS;`

connection.execute({
  sqlText: `${statement}`,
  complete: function(err, stmt, rows) {
    
    if (err) {
      console.log('Failed to execute statement due to the following error: ', err.message)
    } else {
      console.log('Successfully executed statement: ' , rows.length)
    }
  }

})