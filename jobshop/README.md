
<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">JOBSHOP-VISUALISATION</h3>
A simple web tool for jobshop visualization.
</div>


## File format

### Problem file

  The first line contains nb_Job and nb_Mach, representing respectively the number of jobs and machines
  
  | nb_Job | nb_Mach ||||
  |:------:|:-------:|:---------:| :------------:| :------------:|


After the first line, each line should represent a Job, and a set of (id_machine, task_duration) pair:

    | id_task0_mach | task_0_dur | id_task1_mach | task_1_dur | .... | id_taskn_mach | task_n_machine |
    
    id_task(x)_mach should start by 0.

    id_task(x)_machine : machine on which the task x, will be performed (should start by 0)
    task(x)_dur : task x duration
Example :

    4 4
    2  5  1  13  0  14  3  12
    2  10  3  8  1  6  0  6
    1  14  3  9  2  12  0  12
    1  8  3  7  0  10  2  9

  
### Solution file

In the solution file, each line represent a Job, and each number the start time of each task

    0:| task_0_0_start | task_0_1_start | task_0_2_start | task_0_3_start | .... | task_0_c_start | task_0_n_start |
    1:| task_1_0_start | task_1_1_start | task_1_2_start |  .... | task_0_c_start | task_0_n_start |


Example :


    10 28 41 55
    0 10 22 35
    8 25 34 55
    0 18 25 46
