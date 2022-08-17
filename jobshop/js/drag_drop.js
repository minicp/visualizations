/*
* Jobshop drap&drop
* 20220501_0837
*/

document.addEventListener('DOMContentLoaded', async function () {
    let problemDropArea = document.getElementById('file-upload-form');
    let solutionDropArea = document.getElementById('solution-upload-form');

    // DEFAULT BEHAVIOUR
    function preventDefaults (e) {
        e.preventDefault()
        e.stopPropagation()
    }    

    // PROBLEM
    function dragEnter1(e) {
        preventDefaults(e);
        problemDropArea.children[1].classList.add('highlight')
    }
    function dragOver1(e) {
        preventDefaults(e);
        problemDropArea.children[1].classList.add('highlight')
    }
    function dragLeave1(e) {
        preventDefaults(e);
        problemDropArea.children[1].classList.remove('highlight')
    }
    function drop1(e) {
        preventDefaults(e);
        problemDropArea.children[1].classList.remove('highlight')

        //LET CATCH FILE
        if(!problemDropArea.children[0])
            return false;
        problemDropArea.children[0].files = e.dataTransfer.files;
        problemDropArea.children[0].dispatchEvent(new Event('change'));
    }

    //SOLUTION
    function dragEnter2(e) {
        preventDefaults(e);
        solutionDropArea.children[1].classList.add('highlight')
    }
    function dragOver2(e) {
        preventDefaults(e);
        solutionDropArea.children[1].classList.add('highlight')
    }
    function dragLeave2(e) {
        preventDefaults(e);
        solutionDropArea.children[1].classList.remove('highlight')
    }
    function drop2(e) {
        preventDefaults(e);
        solutionDropArea.children[1].classList.remove('highlight')

        //LET CATCH FILE
        if(!solutionDropArea.children[0])
            return false;
        solutionDropArea.children[0].files = e.dataTransfer.files;
        solutionDropArea.children[0].dispatchEvent(new Event('change'));
    }

    // ATTACH LISTENER
    if(problemDropArea) {
        problemDropArea.addEventListener('dragenter',   dragEnter1)
        problemDropArea.addEventListener('dragover',    dragOver1)
        problemDropArea.addEventListener('dragleave',   dragLeave1)
        problemDropArea.addEventListener('drop',        drop1)
    }
    
    if(solutionDropArea){
        solutionDropArea.addEventListener('dragenter',   dragEnter2)
        solutionDropArea.addEventListener('dragover',    dragOver2)
        solutionDropArea.addEventListener('dragleave',   dragLeave2)
        solutionDropArea.addEventListener('drop',        drop2)    
    }
});

