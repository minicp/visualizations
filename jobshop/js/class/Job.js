export default class Job {
    data = [];
    constructor(tasks) {
        tasks.forEach(task => {
            this.data.push(task.data);
        });
    }

    toString() {
        return ""+this.data+"";
    }
}