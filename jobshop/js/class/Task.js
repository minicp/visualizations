export default class Tasks {
    data = {
        'idMachine':null,
        'machineColor':null,
        'duration':null
    };

    constructor(idMachine, duration, color) {
        this.idMachine = idMachine;
        this.duration = duration;
        this.machineColor = color;
    }

    toString() {
        return 'TASK {\n\tidMachine:'+
        this.idMachine+'\n\tduration:'+
        this.duration+'\n\tmachineColor:'+
        this.machineColor+
        '}';
    }
}