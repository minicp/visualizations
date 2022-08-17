/*
* Jobshop problem reader
* 20220429_1124
*/

// GLOBAL VAR
var problem_loaded = false;
var solution_loaded = false;
window.solution_data = {};
window.make_span = {};
window.problem_data = {};
window.files_loaded = {};


// LISTENER
document.addEventListener('DOMContentLoaded', async function () {
    if(document.getElementById('problem-upload')){
        document.getElementById('problem-upload').onchange = function(){
            readProblemFile('problem-upload');
        };
    } 
    
    if(document.getElementById('solution-upload')){
        document.getElementById('solution-upload').onchange = function(){
            readSolutionFile('solution-upload');
        };
    }
});


// MAIN FUNCTIONS
function readProblemFile(dom_file_id) {
    var input = [];

    const fileList = document.getElementById(dom_file_id).files;
    let fileContent = "";

    const reader = new FileReader();
    reader.onload = () => {
        fileContent = reader.result;
        var fileContentArray = fileContent.split(/\r\n|\n/);
        for(var line = 0; line < fileContentArray.length-1; line++){
            if(!(/\D/.test(fileContentArray[line].replace(/\s+/g,"")))) {
                let _temp =  removeItem(fileContentArray[line].split(" "), "")
                if(_temp.length != 0) {
                    input.push(_temp);
                }
            }
        }

        const DATA = formatProblemData(input);
        if(DATA != null) {
            problem_loaded = true;
            solution_loaded = false;
            window.problem_data = DATA;
            // CALL SLOT TO REFRESH SCREEN
            refreshScreen('problemHiddenValidator');
        }
    }
    reader.readAsText(fileList[0]);
}

function readSolutionFile(dom_file_id) {
    const fileList = document.getElementById(dom_file_id).files;
    let fileContent = "";
    var input = [];    

    const reader = new FileReader();
    reader.onload = () => {
        fileContent = reader.result;
        var fileContentArray = fileContent.split(/\r\n|\n/);
        for(var line = 0; line < fileContentArray.length-1; line++){
            //input.push(fileContentArray[line]);
            if(!(/\D/.test(fileContentArray[line].replace(/\s+/g,"")))) {
                let _temp = removeItem(fileContentArray[line].split(" "), "")
                if(_temp.length != 0) {
                    input.push(_temp);
                }
            }
        }

        const DATA = formatSolutionData(input, dom_file_id);
        if(DATA != null) {
            solution_loaded = true;
            window.solution_data = DATA[0];
            window.make_span = DATA[1];
            document.getElementById('solution-upload-form').children[1].classList.add('uploaded');
            
            // CALL SLOT TO REFRESH SCREEN
            refreshScreen('solutionHiddenValidator');
        }
    }
    reader.readAsText(fileList[0]);
}

// DATA PROCESSOR
function formatProblemData(input_tab) {
    var dict = {
        'nMachine':0,
        'nJob':0,
        'jobList':[],
        'colors':[]
    };

    if(input_tab.length != 0) {
        if(input_tab[0].length >= 2) {
            if (! check_id_mach(input_tab)) {
                errorOnUpload("Oops ! An error occurred. Please make sure that: your machines IDs start by 0 and end by (mach_size-1) ", "error-popup", 4000);
                return null;
            }
            dict.nMachine = parseInt(input_tab[0][0], 10);
            dict.nJob     = parseInt(input_tab[0][1], 10);
            const COLORS = makeMachineColorsforcanvas(dict.nMachine);
            dict.colors = COLORS;
            if(dict.nJob == input_tab.length-1) {
                for(let i = 1; i < input_tab.length; i++) {
                    if(isEven(input_tab[i].length)) {
                        var _task = [];
                        for(let j = 0; j < input_tab[i].length; j+=2) {
                            let t = {'idMachine':parseInt(input_tab[i][j], 10), 'duration':parseInt(input_tab[i][j+1], 10), 'machineColor':COLORS[input_tab[i][j]], 'id': i.toString()+'T'+j.toString()};
                            _task.push(t);
                        }

                        dict.jobList.push(jobBuilder(_task, i))
                    }
                    else{
                        // alert('ERROR 775');
                        errorOnUpload("Oops ! An error occurred. {Job line data must be even }", "error-popup", 4000);
                        return null;
                    }
                }
            }
            else{
                // alert('ERROR 123');
                errorOnUpload("Oops ! An error occurred. {The number of job declared is not equal to the job line number}", "error-popup", 6000);
                return null;
            }
        }
        else {
            //alert('ERROR 117');
            errorOnUpload("Oops ! This file is not correct.", "error-popup", 3000);
            return null;
        }
    }
    else {
        // alert('ERROR 111');
        errorOnUpload("Oops ! An error occurred. {No job line has been entered}", "error-popup", 5000);
        return null;
    }

    return dict;
}

function formatSolutionData(input_tab, dom_file_id) {
    // VARIABLE
    let format_data = [];
    let makespan = [];
    const DATA = window.problem_data;

    if(DATA == null) {
        errorOnUpload("Oops ! Please upload problem file first.", "error-popup", 6000);
        return null;
    }

    // INITIALIZATION
    for(let i = 0; i < DATA.nMachine; i++) {
        format_data.push({'machine':i, 'ordered_tasks':{}});
    }
    errorOnUpload
    // DATA PARSER LOGIC
    function dataParser() {
        let solution_plain_data = input_tab;
        // COMMENT THOSE 2 LINES TO USE NEW SOLUTION FILE FORMAT
        //solution_plain_data = solution_plain_data.replaceAll('{', '');
        //solution_plain_data = solution_plain_data.replaceAll('}', '');
        // =====================================================
        let solution_object_data = [];
        try {
            //solution_objec.0t_data = JSON.parse(solution_plain_data);
            for(let i = 0; i < solution_plain_data.length; i++) {
                solution_object_data.push([]);
                for(let j = 0; j < solution_plain_data[i].length; j++) {
                    solution_object_data[i][j] = parseInt(solution_plain_data[i][j], 10)
                }
            }
        }
        catch(err) {
            errorOnUpload("Oops ! An error occurred. {"+err.message+"}.", "error-popup", 8000);
            return null;
        }

        // Precedence constraints on tasks inside a given job
        for(let i = 0; i < solution_object_data.length; i++) {
            for(let j = 0; j < solution_object_data[i].length-1; j++) {
                if((DATA.jobList[i].tasks[j].duration + solution_object_data[i][j]) > (solution_object_data[i][j+1])) {
                    errorOnUpload("Oops ! Please upload correct solution file. {Tasks are overlapping at job "+(i+1)+"}.", "error-popup", 8000);
                    return null;
                }
            }
        }
        // ===================================================



        if(solution_object_data.length == DATA.nJob) {
            for(let i = 0; i < DATA.jobList.length; i++) {
                for(let j = 0; j < DATA.jobList[i].tasks.length; j++) {
                    let machineId = getKeyByValue(DATA.colors, DATA.jobList[i].tasks[j].machineColor);
                    let newTask = DATA.jobList[i].tasks[j];
                    newTask['job_name'] = i+1;
                    newTask['start_at'] = solution_object_data[i][j];
                    makespan.push(newTask.duration + newTask.start_at);

                    if(!Object.keys(format_data[machineId].ordered_tasks).includes(solution_object_data[i][j].toString())) {
                        format_data[machineId].ordered_tasks[solution_object_data[i][j]] = newTask;
                    }
                    else{
                        errorOnUpload("Oops ! Please upload correct solution file. {Tasks start at same time("+solution_object_data[i][j]+") in machine "+machineId+"}.", "error-popup", 8000);
                        return null;
                    }
                }
            }
            for(let i = 0; i < DATA.jobList.length; i++) {
                for(let j = 0; j < DATA.jobList[i].tasks.length; j++) {
                    let machineId = getKeyByValue(DATA.colors, DATA.jobList[i].tasks[j].machineColor);
                    format_data[machineId].ordered_tasks = Object.values(format_data[machineId].ordered_tasks)
                }
            }
            // No overlapping tasks on a given machine 
            for (let index = 0; index < format_data.length; index++) {
                const machine = format_data[index];
                for(let i = 0; i < machine.ordered_tasks.length-1; i++) {
                    let tasks = machine.ordered_tasks;
                    if((tasks[i].duration + tasks[i].start_at) > (tasks[i+1].start_at)) {
                        errorOnUpload("Oops ! Please upload correct solution file. {Tasks are overlapping at machine "+(i+1)+"}.", "error-popup", 8000);
                        return null;
                    }
                }
            }
            // ===================================================

            return [format_data, Math.max(...makespan)];
        }
        else {
            errorOnUpload("Oops ! An error occurred. {The solution and problem files do not contain the same number of jobs}.", "error-popup", 8000);
            return null;
        }
    }

    // CHECK IF FILE UPLOADER COME FROM FIRTS PAGE OR FROM DRAWER.HTML
    let fileUploder = document.getElementById(dom_file_id);
    if(fileUploder && fileUploder.getAttribute('data') == "inDrawerScreen") {
        return dataParser();
    }
    else{
        // PROCESSING
        if(problem_loaded) {         
            if(input_tab.length != 0) {
                return dataParser();
            }
            else {
                errorOnUpload("Oops ! An error occurred. {Your file is empty or not recognized}.", "error-popup", 6000);
                return null;
            }
        }
        else {
            errorOnUpload("Oops ! You must upload problem file first.", "error-popup", 6000);
            return null;
        }
    }
}

// RANDOM COLOR MAKER
function makeMachineColors(nMachine) {
    function randomColorGenerator(){
        let ramdom_color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        return ramdom_color;
    }

    let colors = [];
    
    for(let i=0; i < nMachine; i++) {
        while(1) {
            let color = randomColorGenerator();
            if(!colors.includes(color) && color != '#5f6982' && color != "#000" && color != "#aaa5a5" && color != "#fff") {
                colors.push(color);
                break;
            }
        }
    }

    return colors;
}

/**
 *
 * @param nMachine
 * @returns {*[]}
 */
function makeMachineColorsforcanvas(nMachine){
    let colors = [];
    for (let i = 0; i < nMachine; i++) {
        var color = randomColor();
        while( (color in colors) || typeof(color.getSource()) === 'undefined'){
            color = randomColor();
        }
        colors[i] = color.toRgba();
    }
    return colors;
}

/**
 * random color generator
 * @returns 
 */
 function randomColor(){
    var randomColor = Math.floor(Math.random()*16777215).toString(16);
    return  fabric.Color.fromHex(randomColor);
}

// ERROR HANDLER
async function errorOnUpload(msg, error_blog_id, time) {
    let errorBox = document.getElementById(error_blog_id);
    errorBox.children[0].innerHTML = "<span class='closebtn' onclick=\"this.parentElement.style.display='none';\">&times;</span>"+msg+"";
    errorBox.classList.remove('d-none');
    setTimeout(() => {
        errorBox.classList.add('d-none');
    }, time);
}

// OTHERS FUNCTIONS
function removeItem(input, item) {
    let new_input = input.filter(i => i !== item);
    return new_input;
}

function isEven(num) { 
    return !(num % 2);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function jobBuilder(tasks, num) {
    let data = {
        'name':null,
        'tasks':[]
    };
    data.name = 'job ' + num;
    tasks.forEach(task => {
        data.tasks.push(task);
    });
    return data;
}

function gotoDrawer(link) {
    setTimeout(window.location.replace(link), 2000);
}

function refreshScreen(type) {
    window.files_loaded = [problem_loaded, solution_loaded];
    let validator = document.getElementById(type);
    validator.dispatchEvent(new Event('click'));
}

/**
 * checks if input contains valid IDs machine
 * @param input
 * @returns {boolean}
 */
function check_id_mach(input) {
    let mach_len = input[0][0];
    for (let i = 1; i < input.length; i++) {
        for (let j = 0; j < input[i].length; j=j+2) {
            if (0 > input[i][j] || input[i][j] >= mach_len )
            {
                return (false);
            }
        }
    }
    return (true);
}
