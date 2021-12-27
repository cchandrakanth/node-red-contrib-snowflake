module.exports = function(RED){
    function SnowflakeConfig(config) {
        RED.nodes.createNode(this,config)
        this.account = config.account
        this.username = config.username
        this.password = config.password
    }

    RED.nodes.registerType("snowflake-server",SnowflakeConfig)
}
