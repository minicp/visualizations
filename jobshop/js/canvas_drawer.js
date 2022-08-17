let canvas = {};
let canvas_mach = [];
let canvas_tasks = {};
let canvas_jobs = [];
let canvas_tasks_solution = [];
let canvas_chart = {};
let canvas_container_elm;
$(document).ready(function(){
    // IF REFRESH SCREEN AND HAVE ALREADY LOADED BOTH FILES - DRAW BOTH FROM LOCALSTORAGE
    const UPLOADED_FILES_STATUS = window.files_loaded;
    canvas_container_elm = $("#canvas-container");
    if(UPLOADED_FILES_STATUS != null && UPLOADED_FILES_STATUS[0] && UPLOADED_FILES_STATUS[1]) {
        // DRAW LEGEND
        drawLegend();

        // Init the canvas
        canvas = initCanvas(canvas_container_elm.width(), canvas_container_elm.height());
        drawProblemAndSolution();
        $(".run-solution").click( ()=>{resolveAllJobs(1000)});
        $(".quick-run-solution").click(()=>{resolveAllJobs(0)});
    }

    // IF UPLOAD PROBLEM FILE DRAW JOB

    $("#problemHiddenValidator").click(()=>{
        canvas = initCanvas(canvas_container_elm.width(), canvas_container_elm.height());
        drawProblemOnly();
    });

    // IF UPLOAD PROBLEM&SOLUTION FILE DRAW JOB&SOLUTION
    document.getElementById('solutionHiddenValidator').addEventListener('click', () => {
        canvas = initCanvas(canvas_container_elm.width(), canvas_container_elm.height());
        drawProblemAndSolution();
        $(".run-solution").click( ()=>{resolveAllJobs(1000)});
        $(".quick-run-solution").click(()=>{resolveAllJobs(0)});
        $(".hide-deadline-chart").click(()=>{
            hideJobChart();
        });
    });
});



/**
 * Draw the problem (only jobs and tasks).
 */
function drawProblemOnly() {
    // DRAW LEGEND
    drawLegend();
    const DATA = window.problem_data;
    if(DATA != null) {
        const JOBLIST = DATA.jobList;
        //DRAW IF PROBLEM 
        if(JOBLIST){
            drawProblem(JOBLIST);
        }
    }
}

/**
 * 
 * @param {array} jobs 
 * @param {boolean} solution define if solution was uploaded or not
 */
function drawProblem(jobs, solution = false) {
    drawJob(jobs, solution);
    
    let make_span_div = document.getElementsByClassName('makespan')[0];
    if(make_span_div != null) {
        make_span_div.style.display = "none";
    }
}

/**
 * Draw Job and machine if solution
 */
function drawProblemAndSolution() {
    // VARIABLE
    const DATA = window.problem_data;
    const MAKE_SPAN = window.make_span;
    const UPLOADED_FILES_STATUS = window.files_loaded;

    if(DATA != null) {
        const SOLUTION_DATA = window.solution_data;
        const JOBLIST = DATA.jobList;
        let legendContainer = document.createElement('div');
        legendContainer.setAttribute('class', 'legend-container');

        if(UPLOADED_FILES_STATUS != null && UPLOADED_FILES_STATUS[0]) {
            //DRAW IF PROBLEM AND SOLUTION
            if(SOLUTION_DATA){
                drawMachines(SOLUTION_DATA);
                drawJob(JOBLIST, true);
            }else{
                document.getElementById('solutionUploader2').style.display="flex";
                document.getElementById('solutionUploader2').classList.add('solution-area');
            }
        }
    }    

    if(MAKE_SPAN != null && UPLOADED_FILES_STATUS[0] && UPLOADED_FILES_STATUS[1]) {
        let make_span_div = document.getElementsByClassName('makespan')[0];
        if(make_span_div != null) {
            make_span_div.children[0].innerHTML = "MAKESPAN : " + MAKE_SPAN;
            make_span_div.style.display = "block";
        }
    }
}

/**
 * Machine legend
 */
function drawLegend() {
    // VARIABLE
    const DATA = window.problem_data;
    const UPLOADED_FILES_STATUS = window.files_loaded;

    if(DATA != null) {
        const MACHINE_COLORS = DATA.colors;
        document.getElementsByClassName('right-legend-container')[0].innerHTML=null;
        let legendContainer = document.createElement('div');
        legendContainer.setAttribute('class', 'legend-container');

        if(UPLOADED_FILES_STATUS != null && UPLOADED_FILES_STATUS[0]) {
            // DRAW LEGEND
            MACHINE_COLORS.forEach((color, i) => {
                let legendRow = document.createElement('div');
                legendRow.setAttribute('class', 'legend-row');
                let machineColor = document.createElement('div');
                machineColor.setAttribute('class', 'machine-color');
                machineColor.setAttribute('style', 'background-color:'+color+';');
                let machineLabel = document.createElement('div');
                machineLabel.setAttribute('class', 'machine-label');
                let p = document.createElement('p');
                p.innerHTML = "Machine "+(i+1)+"";
                machineLabel.appendChild(p);
                legendRow.appendChild(machineColor);
                legendRow.appendChild(machineLabel);

                if(legendContainer.children.length !== 3) {
                    if(i === MACHINE_COLORS.length-1) {
                        legendContainer.appendChild(legendRow);
                        document.querySelector(".right-legend-container").appendChild(legendContainer);        
                    }
                    else {
                        legendContainer.appendChild(legendRow);
                    }
                }
                else{
                    if(i === MACHINE_COLORS.length-1) {
                        document.querySelector(".right-legend-container").appendChild(legendContainer);        
                        legendContainer = document.createElement('div');
                        legendContainer.setAttribute('class', 'legend-container'); 
                        legendContainer.appendChild(legendRow);
                        document.querySelector(".right-legend-container").appendChild(legendContainer);        
                    }
                    else {
                        document.querySelector(".right-legend-container").appendChild(legendContainer);        
                        legendContainer = document.createElement('div');
                        legendContainer.setAttribute('class', 'legend-container'); 
                        legendContainer.appendChild(legendRow);
                    }
                }
            });
        }
    }    
}


/**
 * Draw machine on canvas
 * @param {array} solution_data 
 */
function drawMachines(solution_data){
    var machs_width = ($("#canvas-container").width()/2) - 40;
    let yMax = canvas_container_elm.height();
    solution_data.forEach((mach,i) => {
        var draw_mach = new fabric.Rect({
            width: machs_width,
            height: 50,
            selectable: false,
            fill: '#798299',
            rx: 3,
            ry: 3,
            machine: mach,
            stroke: 'white',
            strokeWidth: .5,
            top: (((yMax * i)) / (window.problem_data.jobList.length) + 45 ),
            left: machs_width + 20
        });
        canvas.add(draw_mach);
        canvas_mach.push(draw_mach);
        //Update the concerned tasks start time
        for (let j = 0; j < mach.ordered_tasks.length; j++) {
            canvas_tasks[mach.ordered_tasks[j].id] = {};
            canvas_tasks[mach.ordered_tasks[j].id]['task_datas'] = mach.ordered_tasks[j];
        }
    });
}


/**
 *
 * @param jobs
 * @param hasSolution
 */
function drawJob(jobs, hasSolution = false){
    
    const factor = (hasSolution) ? getFactor() : getFactor(jobs);
    
    let jobs_width = ($("#canvas-container").width()/2) - 40;
    let yMax = canvas_container_elm.height();
    let jobsColors = colorForJobs(jobs.length);
    let max_width = 0;

    jobs.forEach((job,ind) => {
        // Draw each job as rect on canvas.
        var draw_job = new fabric.Rect({
            width: jobs_width,
            height: 50,
            selectable: false,
            fill: '#798299',
            rx: 3,
            ry: 3,
            stroke: 'white',
            strokeWidth: .5,
            top: (((yMax * ind)) / (jobs.length) + 45 ),
            left: 5,
            hoverCursor: "pointer"
        });
        max_width = (ind+1) * 100;
        canvas.add(draw_job);   
        
        //JOB DESC:
        var name_rect = new fabric.Rect({
            width: 100,
            height: 30,
            rx: 3,
            ry: 3,
            strokeWidth: 3,
            stroke: jobsColors[ind].toRgba(),
            fill: '#798299',
            top: draw_job.top -10,
            left: 10
        });

        // Add job name on canvas
        let name_text = new fabric.Text( job.name, {
            fontSize: 20,
            top: name_rect.top + 5,
            fill: 'white',
            left: name_rect.left + 5
        });

        // CREATE GROUP Job name
        let job_name = new fabric.Group([ name_rect, name_text ], {
            left: 5 ,
            top: name_rect.top - 30,
            selectable: false
        });
        canvas.add(job_name);
        
        canvas_jobs[ind] = [];

        if (hasSolution) {
            job_name.on('mousedown', function(e) {
                resolveJob(canvas_jobs[ind], ind, 500, !e.e.ctrlKey);
            });

            draw_job.on('mousedown', function(e) {
                resolveJob(canvas_jobs[ind], ind, 200, !e.e.ctrlKey);
            });

            canvas.on('mouse:over', function(e) {
                if(e.target === draw_job) {
                    e.target.set("strokeWidth", 2);
                    e.target.set("stroke", jobsColors[ind].toRgba());
                    canvas.renderAll();
                }
            });

            canvas.on('mouse:out', function(e) {
                if(e.target === draw_job) {
                    e.target.set("strokeWidth", .5);
                    e.target.set("stroke", 'white');
                    canvas.renderAll();
                }
            });
        }

        // Draw tasks inside current job
        let prev_task_left =  0;
        for (let i = 0; i < job.tasks.length; i++) {
            
            let rect1_task = new fabric.Rect({
                height: 25,
                selectable: false,
                width: (job.tasks[i].duration*factor) - 10,
                fill: job.tasks[i].machineColor,
                top: draw_job.top + 7,
                left: 10 +  prev_task_left
            });

            let rect2_task = new fabric.Rect({
                height: 10,
                selectable: false,
                width: (job.tasks[i].duration*factor) - 10,
                fill: jobsColors[ind].toRgba(),
                top: draw_job.top + 32,
                left: 10 +  prev_task_left
            });
            
            //Group both rects
            let rect_task = new fabric.Group([ rect1_task, rect2_task ], {
                left: 10 +  prev_task_left,
                top: draw_job.top + 7
            });
            

            // Create text object for duration
            let text_task = new fabric.Text("[" + job.tasks[i].duration + "]", {
                fontSize: 15,
                top: rect_task.top + 5,
                fill: 'white',
                left: rect_task.left + 5
            });

            let task = new fabric.Group([ rect_task, text_task ], {
                left: 10 +  prev_task_left,
                selectable: false,
                top: draw_job.top + 7
            });
            prev_task_left =  task.width + task.left;
            //Add drew task on canvas
            canvas.add(task);
            canvas_jobs[ind].push(job.tasks[i].id);
            
            if(hasSolution) {
                canvas_tasks[job.tasks[i].id].canvas_task = task;
            }
        }
    });

    // load solution animation after 300ms
    if (hasSolution) {
        addChart(max_width, factor);
        setTimeout( ()=>{
            resolveAllJobs()
        }, 300);
    }


}


/**
 * 
 * @param {array} jobs 
 * @returns number , will be used to draw tasks
 */
function getFactor( jobs = {}){
    let max_duration = 0;

    if (Object.keys(jobs).length !== 0) {
        // THis get the factor if not solution
        jobs.forEach(job => {
            let tmp_max_duration = 0;
            job.tasks.forEach(task => {
                tmp_max_duration += task.duration;
            });
            max_duration = (tmp_max_duration>max_duration) ? tmp_max_duration : max_duration;
        });

    } else {
        // THis get the factor if solution
        for (const [key, task] of Object.entries(canvas_tasks)) {
            let tmp_max_duration = task.task_datas.duration + task.task_datas.start_at;
            max_duration = (tmp_max_duration>max_duration) ? tmp_max_duration : max_duration;
        }
    }

    let width = ($("#canvas-container").width()/2) - 40;
    return width/max_duration;
}

/**
 * 
 * @param {Number} ms 
 * @returns 
 */
const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 *
 * @param canvas_job
 * @param job_ind
 * @param ms
 * @param hide_all_prev
 * @returns {Promise<void>}
 */
async function resolveJob(canvas_job, job_ind, ms, hide_all_prev = true){
    let factor  = getFactor();
    
    if (hide_all_prev) {
        // Remove all previous cloned task for animation on machines
        hideAllClonedJob();
    }

    if( canvas_tasks_solution[job_ind] && canvas_tasks_solution[job_ind].length !== 0 ) {
        for (let i = 0; i < canvas_tasks_solution[job_ind].length; i++) {
            canvas.remove(canvas_tasks_solution[job_ind][i]);
        }
        canvas.renderAll();
    }

    canvas_tasks_solution[job_ind] = [];
    
    //var color = colorForJobs(1);
    for (let i = 0; i < canvas_job.length; i++) {
        
        // Get current task and its machine on canvas 
        const task = canvas_tasks[canvas_job[i]];
        const task_machine = canvas_mach[task.task_datas.idMachine];

        // Clone task on canvas
        let current_canvas_task = fabric.util.object.clone(task.canvas_task);

        canvas_tasks_solution[job_ind].push(current_canvas_task);
        canvas.add(current_canvas_task);
        
        // Translate the task to its machine 
        current_canvas_task.animate({ top: 7 + task_machine.top, left: task_machine.left + task.task_datas.start_at * factor }, {
            onChange: canvas.renderAll.bind( canvas ),
            duration: ms
        });
        // Project task to axis
        // Wait ms before next task
        await delay(ms);
        addTaskDeadLineChart(canvas_job[i], factor);
    }
}

/**
 * Display all jobs solution
 */
async function resolveAllJobs(ms = 0){
    
    // Remove all previous cloned task for animation on machines
    hideAllClonedJob();
    for (let index = 0; index < canvas_jobs.length; index++) {
        let result = resolveJob(canvas_jobs[index], index, ms, false);
        await result;
    }
}

/**
 * random color generator
 * @returns 
 */
function randomColor(){
    let randomColor = Math.floor(Math.random()*16777215).toString(16);
    return  fabric.Color.fromHex(randomColor);
}


/**
 * Generate nbJObs random colors
 * @param {Number} nbJobs 
 * @returns array of colors
 */
function colorForJobs(nbJobs){
    let colors = [];
    for (let i = 0; i < nbJobs; i++) {
        let color = randomColor();
        while( (color in colors) || typeof(color.getSource()) === 'undefined'){
            color = randomColor();
        }
        colors[i] = color;
    }
    return colors;
}

/**
 * 
 * @param {Number} width 
 * @param {Number} height 
 * @returns fabric canvas object
 */
function initCanvas(width, height) {
    
    // Remove the canvas container element if exist
    if ( $(".canvas-container")[0] ) {
        let html_canvas = '<canvas id="jobshop_canvas"></canvas>';
        $(".job-draw.dashed-container").append(html_canvas);
        $(".canvas-container")[0].remove();
    }

    var canvas = new fabric.Canvas("jobshop_canvas", {
        width: width,
        height: height
    });
    canvas_mach = [];
    canvas_tasks = {};
    canvas_jobs = [];
    return canvas;
}

/**
 * hide all cloned job on machine side
 */
function hideAllClonedJob() {
    for (let index = 0; index < canvas_jobs.length; index++) {
        if( canvas_tasks_solution[index] && canvas_tasks_solution[index].length !== 0 ) {
            for (let i = 0; i < canvas_tasks_solution[index].length; i++) {
                canvas.remove(canvas_tasks_solution[index][i]);
            }
            canvas.renderAll();
        }
    }

    for (const taskID in canvas_chart.task_deadlines) {
        if (canvas_chart.task_deadlines[taskID]){
            canvas.remove(canvas_chart.task_deadlines[taskID]);
        }
    }
}

/**
 *
 * @param max_width
 * @param factor factor used to draw task
 */
function addChart(max_width, factor) {
    let max_duration = window.make_span;
    let left_pos = ($("#canvas-container").width()/2) - 20;
    let  xAxis = canvas_container_elm.height() - 40;

    let vertical_line = new fabric.Line([left_pos, 30, left_pos , xAxis], {
        stroke: 'rgba(255,255,255,.5)',
        strokeWidth: 1,
        selectable: false
    });

    let horizontal_line = new fabric.Line([vertical_line.left, xAxis, (vertical_line.left*2 ) , xAxis],{
        stroke: 'rgba(255,255,255,.5)',
        strokeWidth: 1,
        selectable: false
    });
    canvas.add(vertical_line);
    canvas.add(horizontal_line);
    canvas_chart['hz_line'] = horizontal_line;

    for (let i = 0; i < max_duration; i = i+5) {
        let circle = new fabric.Circle({
            radius: 5,
            fill: 'rgba(255,255,255,1)',
            left:  ((vertical_line.left + (i * factor)) - ((i !== 0) ? 10: 0)-2.5),
            top: horizontal_line.top -3,
            selectable: false
        });

        // Add job name on canvas
        let time_text = new fabric.Text( ""+i, {
            fontSize: 15,
            top: xAxis + 10,
            fill: 'white',
            left: circle.left,
            selectable: false,
        });

        //Add text (number representing the time)
        canvas.add(circle);
        canvas.add(time_text);
    }
    canvas_chart['task_deadlines'] = {};
}

/**
 *
 * @param taskID the task ID
 * @param factor factor used to draw task
 */
function addTaskDeadLineChart(taskID,  factor) {
    let left_pos = ($("#canvas-container").width()/2) - 20;
    let cur_task = canvas_tasks[taskID];
    let task_machine = canvas_mach[cur_task.task_datas.idMachine];
    let deadline = cur_task.task_datas.duration + cur_task.task_datas.start_at;
    let line_col = canvas_tasks[taskID].canvas_task._objects[0]._objects[1].fill;

    let vertical_ = new fabric.Line([ (left_pos + (deadline*factor) - 10), task_machine.top + 30, (left_pos + (deadline*factor)  -10) , canvas_chart.hz_line.top], {
        stroke: line_col,
        strokeWidth: 1,
        selectable: false
    });
    canvas_chart['task_deadlines'][taskID] = vertical_;
    canvas.add(vertical_);
}

/**
 *
 */
function hideJobChart() {
    for (const taskID in canvas_chart.task_deadlines) {
        if (canvas_chart.task_deadlines[taskID]){
            canvas_chart.task_deadlines[taskID].visible = !canvas_chart.task_deadlines[taskID].visible;
        }
        console.log(taskID);
    }
    canvas.renderAll();
}