// ===============================
// MFT & MVT Memory Allocation
// Part 1
// ===============================

let nextFitIndex = 0;

function loadSample() {

document.getElementById("memorySize").value = 1000;
document.getElementById("partitionSize").value = 200;
document.getElementById("processes").value = "120,180,90,250,150";

}

function resetSimulator(){

document.getElementById("memorySize").value="";
document.getElementById("partitionSize").value="";
document.getElementById("processes").value="";

document.getElementById("resultTable").innerHTML="";
document.getElementById("memoryVisualization").innerHTML="";

document.getElementById("totalMemory").innerHTML="0 KB";
document.getElementById("usedMemory").innerHTML="0 KB";
document.getElementById("freeMemory").innerHTML="0 KB";
document.getElementById("internalFrag").innerHTML="0 KB";
document.getElementById("externalFrag").innerHTML="0 KB";

nextFitIndex=0;

}

function simulate(){

const memory=parseInt(document.getElementById("memorySize").value);

const partition=parseInt(document.getElementById("partitionSize").value);

const processes=document.getElementById("processes")
.value
.split(",")
.map(Number);

const type=document.getElementById("allocationType").value;

const algo=document.getElementById("algorithm").value;

if(type==="mft"){

simulateMFT(memory,partition,processes,algo);

}else{

simulateMVT(memory,processes,algo);

}

}

function simulateMFT(memory,partition,processes,algo){

let partitions=[];

let count=Math.floor(memory/partition);

for(let i=0;i<count;i++){

partitions.push(partition);

}

allocate(processes,partitions,algo,true);

}

function simulateMVT(memory,processes,algo){

let blocks=[memory];

allocate(processes,blocks,algo,false);

}
// ===============================
// Part 2 - Allocation Algorithms
// ===============================

function allocate(processes, blocks, algo, isMFT) {

    let allocation = new Array(processes.length).fill(-1);
    let internalFrag = 0;
    let nextPointer = nextFitIndex;

    for (let i = 0; i < processes.length; i++) {

        let index = -1;

        if (algo === "first") {

            for (let j = 0; j < blocks.length; j++) {
                if (blocks[j] >= processes[i]) {
                    index = j;
                    break;
                }
            }

        }

        else if (algo === "best") {

            let best = Number.MAX_VALUE;

            for (let j = 0; j < blocks.length; j++) {

                if (blocks[j] >= processes[i] && blocks[j] < best) {
                    best = blocks[j];
                    index = j;
                }

            }

        }

        else if (algo === "worst") {

            let worst = -1;

            for (let j = 0; j < blocks.length; j++) {

                if (blocks[j] >= processes[i] && blocks[j] > worst) {
                    worst = blocks[j];
                    index = j;
                }

            }

        }

        else if (algo === "next") {

            let checked = 0;

            while (checked < blocks.length) {

                if (blocks[nextPointer] >= processes[i]) {
                    index = nextPointer;
                    nextPointer = (nextPointer + 1) % blocks.length;
                    break;
                }

                nextPointer = (nextPointer + 1) % blocks.length;
                checked++;

            }

        }

        if (index != -1) {

            allocation[i] = index;

            if (isMFT) {

                internalFrag += blocks[index] - processes[i];
                blocks[index] = 0;

            } else {

                blocks[index] -= processes[i];

            }

        }

    }

    nextFitIndex = nextPointer;

    displayResult(processes, allocation, blocks, internalFrag, isMFT);

}
// ===============================
// Part 3 - Results & Statistics
// ===============================

function displayResult(processes, allocation, blocks, internalFrag, isMFT) {

    let table = document.getElementById("resultTable");
    table.innerHTML = "";

    let usedMemory = 0;

    for (let i = 0; i < processes.length; i++) {

        let row = document.createElement("tr");

        let status = allocation[i] == -1
            ? "<span style='color:red'>Not Allocated</span>"
            : "<span style='color:lime'>Allocated</span>";

        row.innerHTML = `
            <td>P${i + 1}</td>
            <td>${processes[i]} KB</td>
            <td>${allocation[i] == -1 ? "-" : allocation[i] + 1}</td>
            <td>${status}</td>
        `;

        table.appendChild(row);

        if (allocation[i] != -1)
            usedMemory += processes[i];
    }

    let totalMemory = parseInt(document.getElementById("memorySize").value);

    let freeMemory = totalMemory - usedMemory;

    document.getElementById("totalMemory").innerHTML =
        totalMemory + " KB";

    document.getElementById("usedMemory").innerHTML =
        usedMemory + " KB";

    document.getElementById("freeMemory").innerHTML =
        freeMemory + " KB";

    document.getElementById("internalFrag").innerHTML =
        isMFT ? internalFrag + " KB" : "0 KB";

    document.getElementById("externalFrag").innerHTML =
        !isMFT ? freeMemory + " KB" : "0 KB";

    drawMemory(blocks, allocation);

}
// ===============================
// Part 4 - Memory Visualization
// ===============================

function drawMemory(blocks, allocation) {

    let container = document.getElementById("memoryVisualization");
    container.innerHTML = "";

    for (let i = 0; i < blocks.length; i++) {

        let block = document.createElement("div");

        block.classList.add("memory-block");

        if (blocks[i] === 0) {

            block.classList.add("used");
            block.innerHTML = `
                <strong>Block ${i + 1}</strong><br>
                Used
            `;

        } else {

            block.classList.add("free");
            block.innerHTML = `
                <strong>Block ${i + 1}</strong><br>
                ${blocks[i]} KB Free
            `;

        }

        container.appendChild(block);

    }

}

function showMessage(message){

    alert(message);

}

function validateInput(memory, processes){

    if(isNaN(memory) || memory<=0){

        showMessage("Enter valid memory size.");

        return false;

    }

    if(processes.length===0){

        showMessage("Enter process sizes.");

        return false;

    }

    return true;

}
// ===============================
// Part 5 - Final Initialization
// ===============================

// Run sample data when page loads
window.onload = function () {

    document.getElementById("memoryVisualization").innerHTML =
        "<p>No simulation has been executed.</p>";

};

// Press Enter to simulate
document.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {
        simulate();
    }

});

// Utility function
function getTotalAllocated(allocation) {

    let count = 0;

    for (let i = 0; i < allocation.length; i++) {

        if (allocation[i] !== -1)
            count++;

    }

    return count;

}

// Utility function
function getTotalUnallocated(allocation) {

    let count = 0;

    for (let i = 0; i < allocation.length; i++) {

        if (allocation[i] === -1)
            count++;

    }

    return count;

}

// Utility function
function calculateUtilization(total, used) {

    if (total === 0)
        return 0;

    return ((used / total) * 100).toFixed(2);

}

console.log("MFT & MVT Memory Allocation Simulator Loaded Successfully");
