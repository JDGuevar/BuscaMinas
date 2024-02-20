let tablero = [];
let rows = 10;
let columns = 10;

let mines = 10;

let minesCount = mines;
let flagsCount = minesCount;
let minesLocation = []; // "2-2", "3-4", "2-1"

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let tileSize = 35; // width and height of each tile

let gameOver = false;


window.onload = function() {
    startGame();
}

function shake() {
    document.getElementById("tablero").style.animation = "shake 0.5s";
    setTimeout(() => {
        document.getElementById("tablero").style.animation = "";
    }, 500);
}

const audio_perder = new Audio("perder.mp3");
audio_perder.volume = 0.05;

function setMines() {
    // minesLocation.push("2-2");
    // minesLocation.push("2-3");
    // minesLocation.push("5-6");
    // minesLocation.push("3-4");
    // minesLocation.push("1-1");

    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}


function startGame() {
    document.getElementById("flags-count").innerText = flagsCount;
    setMines();


    let tableroWidth = columns * tileSize;
    let tableroHeight = rows * tileSize;

    //populate our tablero
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.style.width = tileSize - 2 + "px";
            tile.style.height = tileSize - 2 + "px";
            tile.style.fontSize = tileSize * 0.70 + "px";
            tile.addEventListener("click", clickTile);
            tile.addEventListener("contextmenu", RightClick);
            document.getElementById("tablero").append(tile);
            row.push(tile);

        }
        tablero.push(row);
    }
    // Set the width and height of the tablero element

    document.getElementById("tablero").style.width = tableroWidth + "px";
    document.getElementById("tablero").style.height = tableroHeight + "px";

    console.log(tablero);
}
let flaggedTiles = [];

function RightClick() {
    if (gameOver) {
        return;
    }

    event.preventDefault();

    let tile = this;

    if (tile.classList.contains("tile-clicked") || tile.classList.contains("leave")) {
        return;
    }

    if (tile.classList.contains("tile-flagged")) {
        tile.classList.remove("tile-flagged");
        let img = tile.getElementsByTagName("img")[0];
        tile.classList.add("leave");
        img.style.animation = "leave 0.3s";
        setTimeout(() => {
            tile.innerText = "";
            tile.classList.remove("leave");
        }, 298);

        let flagIndex = flaggedTiles.indexOf(tile.id);
        if (flagIndex !== -1) {
            flaggedTiles.splice(flagIndex, 1);
        }

        flagsCount += 1;

        if (minesLocation.includes(tile.id)) {
            minesCount += 1;
        }
        document.getElementById("flags-count").innerText = flagsCount;
    } else {
        if (flagsCount > 0) {
            tile.classList.add("tile-flagged");
            let img = document.createElement("img");
            img.src = "banderita.svg";
            tile.appendChild(img);
            img.style.animation = "fall 0.5s";
            img.style.width = tileSize + 20 + "px";
            img.style.height = tileSize + 20 + "px";

            let audio_banderita = new Audio("hmm.mp3");
            audio_banderita.volume = 0.05;

            audio_banderita.play();

            flaggedTiles.push(tile.id);

            flagsCount -= 1;
            if (minesLocation.includes(tile.id)) {
                minesCount -= 1;
            }
            document.getElementById("flags-count").innerText =flagsCount;
        }
    }

    if (flagsCount == 0) {
        document.getElementById("flags-count").innerText = "No flags left";

        if (minesCount == 0 && tilesClicked == (rows * columns) - mines && flagsCount == 0) {
            document.getElementById("flags-count").innerText = "Congratulations! You won!";
            gameOver = true;
            shake();
        }
    }
}
function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked") || this.classList.contains("tile-flagged")){
        return;
    }

    let tile = this;

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        revealMines();
        return;
    }


    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = tablero[r][c];
            if (minesLocation.includes(tile.id) && !tile.classList.contains("tile-flagged")) {

                tile.classList.add("tile-bomb");
                let img = document.createElement("img");
                img.src = "bomba.svg";
                tile.appendChild(img);
                img.style.width = tileSize + 10 + "px";
                img.style.height = tileSize + 10 + "px";
                tile.style.backgroundColor = "#c44d4d";
                audio_perder.play();
                // Apply the shake animation to the #tablero element
                document.getElementById("tablero").style.animation = "shake 0.5s";
                // Remove the animation after it has finished
                setTimeout(() => {
                    document.getElementById("tablero").style.animation = "";
                }, 500);
            }

            if (minesLocation.includes(tile.id) && tile.classList.contains("tile-flagged")) tile.style.backgroundColor = "#c44d4d";
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns || tablero[r][c].classList.contains("tile-clicked")) {
        return;
    }

    if (tablero[r][c].classList.contains("tile-flagged")) {
        flagsCount+= 1;
        document.getElementById("flags-count").innerText = flagsCount;
    }

    tablero[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    if (minesCount == 0 && tilesClicked == (rows * columns) - mines && flagsCount == 0){
        document.getElementById("flags-count").innerText = "Congratulations! You won!";
        gameOver = true;
        shake();
    }

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        tablero[r][c].innerText = minesFound;
        tablero[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        tablero[r][c].innerText = "";
        
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }
}

function checkTile(r, c) {
    if (r < 0  || r>= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}

function levelEasy() {
    rows = 10;
    columns = 10;
    mines = 10;
    minesCount = mines;
    flagsCount = minesCount;

    reset()
}

function levelMedium() {
    rows = 18;
    columns = 18;
    mines = 40;
    minesCount = mines;
    flagsCount = minesCount;

    reset()
}

function levelHard() {
    rows = 24;
    columns = 24;
    mines = 99;
    minesCount = mines;
    flagsCount = minesCount;

    reset()
}

function reset(){
    document.getElementById("tablero").innerHTML = "";
    tablero = [];
    minesLocation = [];
    tilesClicked = 0;
    gameOver = false;

    startGame();
}
