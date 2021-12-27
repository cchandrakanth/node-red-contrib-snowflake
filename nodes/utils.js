const snowflake = require('snowflake-sdk')

const connect = async (node, server) => {
    return new Promise(function(resolve, reject){
        connection = snowflake.createConnection({
            account: server.account,
            username: server.username,
            password: server.password
        })
        connection.connect( (err, conn) => {
            if (err) {
                reject(err)
            } else {
                successStatus(node,"Connected")
                resolve(connection)            
            }
        })
    })     
}

const destroy = async (conn, node, msg) => {    
    try{
        conn.destroy();
        console.log('Connection destroyed.')       
        return conn
    }
    catch(e){
        handleException(e.messge, node, msg)
    }
}

const executeStmt = async (node, connection, stmt, msg) => {
    await connection.execute({
        sqlText: `${stmt}`,
        complete: (err, stmt) => {
            if(err){
                handleException(err.message, node, msg)
            }
            else{
                console.log('Successfully executed statement', stmt.getSqlText()) 
            }
        }
    })
}

var getRangeOfRows = async(totalRows, input) => {
    var range = {}

    if(input.action === 'first'){
        range.start = 0
        range.end = (input.rows - 1)
    }
    else if(input.action === 'last'){
        range.start = Math.max(0, (totalRows - input.rows))
        range.end = (totalRows - 1)
    }
    else if(input.action === 'range'){
        range.start = input.start
        range.end = input.end
    }
    else{
        range.start = 0
        range.end = (totalRows - 1)
    }

    return range
}

const executecomplexeStmt = async (connection, input) => {

    return new Promise(function(resolve, reject){
        connection.execute({
            sqlText: `${input.sqlText}`,
            binds: input.payload,
            streamResult: true, // prevent rows from being returned inline in the complete callback
            complete: async (err, stmt, rows) => {
                try{
                    let totalRows = stmt.getNumRows()
                    var range = await getRangeOfRows(totalRows, input)
                    rows = []
                    stmt.streamRows({
                        start: range.start,
                        end: range.end
                    })
                    .on('error', function(err) {
                        reject(err)
                    })
                    .on('data', function(row) {                    
                        rows.push(row);
                    })
                    .on('end', function() {
                        console.log('Starting row #: ' + range.start)
                        console.log('Ending row #: ' + range.end)
                        console.log('Number of rows consumed: ' + rows.length);
                        resolve(rows)
                    });
                }
                catch(err){
                    reject(err)
                }
            }
        })
    })          
}

const clearStatus = (node) => {
    node.status({})
}

const successStatus = (node,message) => {
    node.status({fill:"green",shape:"dot",text:message});
}

const infoStatus = (node,message) => {
    node.status({fill:"blue",shape:"ring",text:message});
}

const warningStatus = (node,message) => {
    node.status({fill:"yellow",shape:"dot",text:message});
}

const errorStatus = (node,message) => {
    node.status({fill:"red",shape:"dot",text:message});
}

handleException = (errMsg,node,msg,stopFlow=true) => {
    if(stopFlow){
        node.status({fill:"red",shape:"ring",text:errMsg});
        node.error(errMsg, msg)
    }
    else{
        node.status({fill:"red",shape:"dot",text:errMsg});
    }
}

module.exports = {
    connect,
    destroy,
    executeStmt,
    executecomplexeStmt,
    clearStatus,
    successStatus,
    errorStatus,
    infoStatus,
    warningStatus,
    handleException
}


