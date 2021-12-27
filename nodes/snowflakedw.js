const Utils = require('./utils')

const executeQuery = async (node, msg, connection) => {
    try{
        var wareshouse = msg.warehouse || node.warehouse
        var database = msg.database || node.database
        var schema = msg.schema || node.schema
        var role = msg.role || node.role    
        var input = {}
        input.bind = node.bind
        input.sqlText = msg.sqlText || node.sqlText
        input.action = msg.action || node.action
        input.rows = parseInt(msg.noOfRows || node.rows)
        input.start = parseInt(msg.start || node.start)
        input.end = parseInt(msg.end || node.end)
        input.payload = (node.bind)?msg.payload:[]

        if(role) await Utils.executeStmt(node, connection, 'USE ROLE '+role+';', msg)
        if(wareshouse) await Utils.executeStmt(node, connection, 'USE WAREHOUSE '+wareshouse+';', msg)
        if(database) await Utils.executeStmt(node, connection, 'USE DATABASE '+database+';', msg)
        if(schema) await Utils.executeStmt(node, connection, 'USE '+database+'.'+schema+';', msg)
        
        msg.results = await Utils.executecomplexeStmt(connection, input)
        
        await Utils.destroy(connection, node, msg)
        node.send(msg)
        Utils.successStatus(node,'Execution completed.')
    }catch(e){
        handleException(e.message, node, msg)
    }
}

module.exports = function(RED){
    function SnowflakeConnect(config) {
        RED.nodes.createNode(this,config)           
        this.server = (config.server)?RED.nodes.getNode(config.server):''
        this.warehouse = config.warehouse
        this.database = config.database
        this.schema = config.schema
        this.role = config.role
        this.bind = config.bind
        this.sqlText = config.sqlText
        this.action = config.action
        this.rows = config.rows
        this.start = config.start
        this.end = config.end        
        var node = this         
        
        this.on('input', async (msg) => {
            try{            
                Utils.clearStatus(node)                
                let server = (msg.server)? msg.server : node.server
                if(server){
                    var connection = await Utils.connect(node, server)
                    Utils.infoStatus(node, 'Executing...')
                    await executeQuery(node, msg, connection)                                     
                }
                else{
                    Utils.handleException('Server is not setup', node, msg)
                }
            }catch(e){
                Utils.handleException(e.message, node, msg)
            }                         
        })

        this.on('close', async () => {
            try{
                Utils.clearStatus(node)                            
                if(node.server){                    
                    connection = await Utils.connect(node, node.server)                    
                }
                else{
                    Utils.warningStatus(node,"Server not setup")
                }
            }
            catch(e){
                Utils.errorStatus(node, e.message)
            } 
        })        
        
    }

    RED.nodes.registerType("snowflakedw",SnowflakeConnect)
}
