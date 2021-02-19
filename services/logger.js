class Logger {
    constructor(name = null) {
        this.name = name;
    }
 
    log() {
        let str = "";
        Object.keys(arguments).forEach(key => {
            str += arguments[key].toString();
        })
        console.log(`${this.name ? '[' + this.name + '] ' : ''}${str}`);
    }

    success() {
        let str = "";
        Object.keys(arguments).forEach(key => {
            str += arguments[key].toString();
        });
        console.log(`${this.name ? '[' + this.name + '] ' : ''}\x1b[32m${str}\x1b[0m`);
    }
    info() {
        let str = "";
        Object.keys(arguments).forEach(key => {
            str += arguments[key].toString();
        }) 
        console.log(`${this.name ? '[' + this.name + '] ' : ''}\x1b[36m${str}\x1b[0m`);
    }
    warn() {
        let str = "";
        Object.keys(arguments).forEach(key => {
            str += arguments[key].toString();
        })
        console.log(`${this.name ? '[' + this.name + '] ' : ''}\x1b[33m${str}\x1b[0m`);
    }
    error() {
        let str = "";
        Object.keys(arguments).forEach(key => {
            str += arguments[key].toString();
        })
        console.log(`${this.name ? '[' + this.name + '] ' : ''}\x1b[31m${str}\x1b[0m`);
    }

}


module.exports = Logger;
