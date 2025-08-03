// Global Variables
const socket = io.connect('https://games-online.onrender.com/poker');
let room;

let cardImagesClient = {};
let cardWidth = 50;
let cardHeight = 100;
let cardsPerPlayer = 5;
let deckClient = [];
let handsClient = {};
let backImg;
let playerIndexClient = 0; // Global variable for player index
let users_no;
let players_no = 0;
let users_names = [];
let myName;
let startReq = false;
let myIndex;
let pokerPlayers = [];
let animate;
let cardsToChange = [];
let turn = 0;
let newRoom;
let poker_no;
let bank;
let passed = [];
let bet = false;
let call = false;
let Myraise = 0;
let OppoRaise = [];
let lastValidValue;
let currentBet;
let Ibet = false;
//let myBank = 5;
//let betting = false;
let showMyCards = false;
let showOppoCards = false;
socket.on('connect', () => {
    console.log('Connected to /warcaby namespace');
  
    // Retrieve the stored server data from local storage
    const serverData = JSON.parse(localStorage.getItem('serverData'));
    console.log(serverData);
    myName = serverData.inputText;
    if (serverData) {
        Player = serverData.player;
        playerName = serverData.inputText;
        console.log(Player);
        console.log(playerName);
  
        // Emit the joinServer event with the retrieved data
        socket.emit('joinServer', {
            inputText: serverData.inputText,
            index: serverData.index,
            players: serverData.players,
            player: serverData.player // Send player information
        });
  
        // Optionally, clear the data from local storage if it is no longer needed
        localStorage.removeItem('serverData');
    }
  });

socket.on('joinedRoom', (POKER_ROOM, USER_NAME, USER_NO) => {
    room = POKER_ROOM;
    users_no = USER_NO
    if(users_no > 1) document.getElementById('chip').textContent = 'CLICK TO START THE GAME'
    console.log(`Joined room: ${POKER_ROOM}`);
    socket.emit('im in', room, myName);
});
socket.on('user left', (name_left) => {
    console.log("left");
    document.querySelector('.players');
    const divs = document.querySelectorAll('.users');
    divs.forEach((div) => {
        if (div.textContent === name_left) {
                div.remove(); // Removes the div
        }
    });
    for(let i = 0; i < users_names.length; i++)
        if(name_left == users_names[i])
            users_names.splice(i, 1);
    users_no--;
    if(users_no == 1) document.getElementById('chip').textContent = 'WAIT FOR PLAYERS'    
});

// socket.on('update poker players no', (update_room) => {
//     players_no = update_room.users.length;
//     console.log("new no", players_no);  
// });
socket.on('send im in', (joinedName) => {
    // Check if the joinedName is already in the pokerPlayers array
    const playerExists = pokerPlayers.some(player => player.player === joinedName);

    // If the player does not exist and is not already in users_names, add them
    if (!playerExists && !users_names.includes(joinedName)) {
        users_names.push(joinedName);
        console.log("New player joined:", joinedName);
        $('#players').append(`<div class="users">${joinedName}</div>`);
    }
});

socket.on('poker room', (newRoom) => {
    players_no = newRoom.users.length;
    document.getElementById('buttonContainer').style.display = "none";
    document.getElementById('chip').textContent = 'WAIT FOR PLAYERS';
    $('#players').empty();
    //document.getElementById('myBank').textContent =
    for (let i = 0; i < newRoom.users.length; i++) {
        if (newRoom.users[i].user === myName) {
            myIndex = i;
            bank = newRoom.users[i].bank;
    
            // Clear any existing content inside '#myBank'
            $('#myBank').empty();
    
            // Append name and bank value to '#myBank'
            $('#myBank').append(`<div class="name">${newRoom.users[i].user}</div><div class="bank" value=${i} style="margin-left: 10px;">$${newRoom.users[i].bank}</div>`);
        } 
        else {
            pokerPlayers.push({ player: newRoom.users[i].user, index: i });
    
            // Create a new container div for each player
            const containerDiv = document.createElement('div');
            containerDiv.className = 'playersBank';
            containerDiv.style.display = 'flex';
    
            // Add the player's name and bank value to the new container
            containerDiv.innerHTML = `<div class="name">${newRoom.users[i].user}</div><div class="bank" value=${i} style="margin-left: 10px;">$${newRoom.users[i].bank}</div>`;
    
            // Append the new container to '#playersBank'
            $('#playersBank').append(containerDiv);
    
            // Optionally, append the player's name to '#players' if needed
            $('#players').append(`<div class="message" style="display: flex;"><div class="users" value=${i}>${newRoom.users[i].user}</div><div class="action" value=${i}> </div></div>`);
        }
    }
    
    console.log(myIndex, players_no, pokerPlayers);
    //setBankWidth();
    updateUI();
    
    
    
        
});
socket.on('start round', (state) => {
    //console.log(state);
    newRound = true;
    cardsToChange = [];
    flipChangedCards = false;
    turn = state.turn;
    console.log("new turn", turn);
    //console.log(hands);
    for (let i = 0; i < state.users.length; i++)
        if (state.users[i].pass)
            passed.push(i);
    //console.log(numPlayers);
    poker_no = state.users.length;
    handsClient = state.hands;
    players_no = state.users.length;
    preload();
    renderCards(); 
});
socket.on('changed cards', (newCards) => {
    turn = newCards.turn;
    passed = [];
    for (let i = 0; i < newCards.users.length; i++)
        if (newCards.users[i].pass)
            passed.push(i);
    console.log("turn", turn);
    console.log("passed", passed);
    //console.log(numPlayers);
    handsClient = newCards.hands;
    //players_no = numPlayers;
    //preload();
    renderCards();
 
});
// socket.on('betUpdate', (pokerRoom, raise, raised, pass) => {
//     console.log(pokerRoom);
//     // Destructure data received from the server
//     //const { lastDetectedValue, current, mode, nextPlayerIndex, pot } = data;
//     //if (mode === 'raise') document.getElementById("inputValue").value = current - lastValidValue;
//     const bank = document.querySelector(`.playersBank .bank[value="${pokerRoom.currentBettor}"]`);

// if (bank) {
//     bank.textContent = pokerRoom.users[pokerRoom.currentBettor].bank;
// } else {
//     console.warn("Bank element not found for current bettor.");
// }

//     bank.textContent = pokerRoom.user[pokerRoom.currentBettor].bank;
//     turn = pokerRoom.turn;
//     if (pokerRoom.raise != undefined) OppoRaise.push({value: pokerRoom.raise, turn: pokerRoom.currentBettor});
//     currentBet = pokerRoom.bet;
//     console.log("O", OppoRaise, "M", Myraise, "B", Ibet);
//     let lastRaise = null;

//     for (let i = OppoRaise.length - 1; i >= 0; i--) {
//         if (OppoRaise[i].turn != myIndex) {
//             lastRaise += OppoRaise[i].value;
            
//         }
//         else break;
//     }

//     // if (pokerRoom.turn == myIndex && Myraise > 0 && pass != "pass") {
//     //         console.log(lastValidValue)
            
//     //         //console.log(OppoRaise, Myraise)
        
       
//     //     //Myraise = lastValidValue - OppoRaise;
//     //     console.log(OppoRaise, Myraise);
//     //     document.getElementById("inputValue").value = pokerRoom.bet - Myraise; 
//     // }
//     // else if ((pokerRoom.turn == myIndex || pass == 'pass') && Ibet) {
//     //     console.log("check"); 
//     //     document.getElementById("inputValue").value = pokerRoom.bet - lastValidValue; 
//     // }
//     // else if (pokerRoom.turn == myIndex) {
//     //     console.log("check"); 
//     //     document.getElementById("inputValue").value = pokerRoom.bet; 
//     // }
//     if (!Ibet && myIndex == pokerRoom.turn) document.getElementById("inputValue").value = pokerRoom.bet;
//     else if (Ibet && myIndex == pokerRoom.turn) document.getElementById("inputValue").value = lastRaise;
      
//     passed = [];
//     for (let i = 0; i < pokerRoom.users.length; i++)
//         if (pokerRoom.users[i].pass)
//             passed.push(i);
//     renderCards();
//     // Update the game state and UI based on the bet update
    
// });
socket.on('betUpdate', (pokerRoom, raise, raised, pass) => {
    try {
        console.log(pokerRoom);

        const bank = document.querySelector(`.playersBank .bank[value="${pokerRoom.currentBettor}"]`);

        if (bank) {
            bank.textContent = pokerRoom.users[pokerRoom.currentBettor].bank;
        } else {
            console.warn("Bank element not found for current bettor.");
        }

        turn = pokerRoom.turn;
        if (pokerRoom.raise !== undefined) {
            OppoRaise.push({ value: pokerRoom.raise, turn: pokerRoom.currentBettor });
        }
        currentBet = pokerRoom.bet;
        console.log("O", OppoRaise, "M", Myraise, "B", Ibet);

        let lastRaise = null;

        for (let i = OppoRaise.length - 1; i >= 0; i--) {
            if (OppoRaise[i].turn !== myIndex) {
                lastRaise += OppoRaise[i].value;
            } else break;
        }

        if (!Ibet && myIndex === pokerRoom.turn) {
            document.getElementById("inputValue").value = pokerRoom.currentBetValue;
        } else if (Ibet && myIndex === pokerRoom.turn) {
            document.getElementById("inputValue").value = lastRaise;
        }

        passed = [];
        for (let i = 0; i < pokerRoom.users.length; i++) {
            if (pokerRoom.users[i].pass) {
                passed.push(i);
            }
        }
        renderCards();
    } catch (error) {
        console.error("An error occurred during bet update:", error);
    }
});


socket.on('send message', (player, message, value) => {
    const action = document.querySelector(`div.action[value="${player}"]`);
    if (message == 'bet' || message == 'raised') action.textContent = `${message} ${value}`;
    else action.textContent = message;
});
socket.on('roundEnd', (data) => {
    const { room, message } = data;

    console.log('message', message)
});


socket.on('start changing cards', (cards, cardChangeStartIndex) => {
    turn = cardChangeStartIndex;
    console.log(turn)
    showMyCards = true;
    renderCards();
});

socket.on('my changed cards', () => {
    //console.log(private);
    renderCards();
    
});  
socket.on('update poker players no', (update_room) => {
    //poker_no = update_room.users.length
    console.log(update_room);
    if(update_room == 0) {
        players_no = update_room;
        handsClient = [];
    }
    else players_no = update_room.users.length;
    $('#players').empty();
    $('#playersBank').empty();
    pokerPlayers = [];
    if(update_room != 0) {
        handsClient = update_room.hands;
        for(let i = 0; i < update_room.users.length; i++)
            if(update_room.users[i].user == myName) {
                myIndex = i;
                bank = update_room.users[i].bank
            }
            else {
                pokerPlayers.push({player: update_room.users[i].user, index: i});
                //$('#players').append(`<div class="users" value=${i}>${update_room.users[i].user}</div>`);
                // $('#playersBank').append(`<div class="usersBank" value=${i}>${update_room.users[i].user}'s bank: ${update_room.users[i].bank}</div>`);
                const containerDiv = document.createElement('div');
                containerDiv.className = 'playersBank';
                containerDiv.style.display = 'flex';
    
            // Add the player's name and bank value to the new container
                containerDiv.innerHTML = `<div class="name">${update_room.users[i].user}</div><div class="bank" value=${i} style="margin-left: 10px;">$${update_room.users[i].bank}</div>`;
    
            // Append the new container to '#playersBank'
                $('#playersBank').append(containerDiv);
    
            // Optionally, append the player's name to '#players' if needed
                $('#players').append(`<div class="message" style="display: flex;"><div class="users" value=${i}>${update_room.users[i].user}</div><div class="action" value=${i}> </div></div>`);
            
            }
    }
    console.log(myIndex, players_no, pokerPlayers);
    //setBankWidth();
    updateUI();
    renderCards();     
});

socket.on('restart', () => {
    document.getElementById('buttonContainer').style.display = "flex";
    startReq = false;
      
});
let mess = 'message from client';
console.log(room);

// socket.on('start round', (hands) => {
//     console.log(hands);
    
//     handsClient = hands;
//     players_no = numPlayers;
//     preload();
//     renderCards(); 
// });

socket.on('send to opponent', (Mess) => {
    console.log(`send to opponent: ${Mess}`);
});

socket.on('send to room', (Mess) => {
    console.log(`send to opponent: ${Mess}`);
});

socket.on('privateMessage', (message) => {
    console.log(`privateMessage: ${message}`);
});

// Load images
function preload() {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = [
        { value: 2, name: '2' }, { value: 3, name: '3' }, { value: 4, name: '4' },
        { value: 5, name: '5' }, { value: 6, name: '6' }, { value: 7, name: '7' },
        { value: 8, name: '8' }, { value: 9, name: '9' }, { value: 10, name: '10' },
        { value: 11, name: 'jack' }, { value: 12, name: 'queen' }, { value: 13, name: 'king' },
        { value: 14, name: 'ace' }
    ];

    for (let suit of suits) {
        for (let { value, name } of values) {
            const filePath = `public/css/images/${name}_of_${suit}.svg`;
            cardImagesClient[filePath] = filePath; // Store the path
        }
    }
}

let numPlayers;
let flipChangedCards;
function renderCards() {
    animate = false;
    const playersDiv = document.querySelector('.players');
    const fragment = document.createDocumentFragment(); // Use a fragment to batch updates

    // Clear existing content
    playersDiv.innerHTML = '';

    numPlayers = pokerPlayers.length + 1; // Including the client

    // Create containers for positioning
    const containerDiv = document.createElement('div');
    containerDiv.className = 'players-container';
    
    const top = document.createElement('div');
    top.id = 'top';
    
    const middleDiv = document.createElement('div');
    middleDiv.id = 'middle';
    
    const left = document.createElement('div');
    left.id = 'left';
    
    const right = document.createElement('div');
    right.id = 'right';
    
    if (numPlayers === 3 || numPlayers === 4) {
        fragment.appendChild(top);
        fragment.appendChild(middleDiv);
        middleDiv.appendChild(left);
        middleDiv.appendChild(right);    
    }

    // Render opponents
    pokerPlayers.forEach(({ player, index }) => {
        if (index === myIndex) return; // Skip the client

        const playerIndex = index + 1;
        const hand = handsClient[`Player ${playerIndex}`];

        if (!hand) {
            console.error(`No hand found for Player ${playerIndex}`);
            return;
        }

        const playerDiv = document.createElement('div');
        const rowDiv = document.createElement('div');

        playerDiv.className = 'player';
        playerDiv.id = `player-${playerIndex}`;
        playerDiv.innerHTML = `<h3 class="names">${player}</h3>`;

        rowDiv.className = 'player-row';
        rowDiv.dataset.playerIndexClient = playerIndex;

        hand.forEach((card, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card-container';
            cardContainer.dataset.cardIndex = index;

            const back = document.createElement('div');
            back.className = 'back';
            const backImg = document.createElement('img');
            backImg.className = 'card-img';
            backImg.src = 'css/images/back2.jpg';
            back.appendChild(backImg);

            const front = document.createElement('div');
            front.className = 'front';
            const frontImg = document.createElement('img');
            frontImg.className = 'card-img';
            frontImg.src = cardImagesClient[card.filePath];
            front.appendChild(frontImg);

            const backAndFront = document.createElement('div');
            backAndFront.className = 'back-and-front';
            backAndFront.appendChild(back);
            backAndFront.appendChild(front);

            cardContainer.appendChild(backAndFront);
            rowDiv.appendChild(cardContainer);
        });

        playerDiv.appendChild(rowDiv);

        // Position opponents based on the number of players
        switch (numPlayers) {
            case 2:
                playerDiv.classList.add('top'); // Position opponent at the top
                containerDiv.appendChild(playerDiv);
                break;
            case 3:
                if (myIndex === 0) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                        fragment.appendChild(middleDiv);
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                    }
                } else if (myIndex === 1) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                        fragment.appendChild(middleDiv);
                        middleDiv.style.flexDirection = 'row-reverse';
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                    }
                } else if (myIndex === 2) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                        fragment.appendChild(middleDiv);
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                    }
                }
                middleDiv.appendChild(playerDiv);
                break;
            case 4:
                if (myIndex === 0) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                        left.appendChild(playerDiv);
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                        top.appendChild(playerDiv);
                    } else if (index === 3) {
                        playerDiv.classList.add('middle-between');
                        right.appendChild(playerDiv);
                    }
                } else if (myIndex === 1) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                        right.appendChild(playerDiv);
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                        left.appendChild(playerDiv);
                    } else if (index === 3) {
                        playerDiv.classList.add('middle-between');
                        top.appendChild(playerDiv);
                    }
                } else if (myIndex === 2) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                        top.appendChild(playerDiv);
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                        right.appendChild(playerDiv);
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                    } else if (index === 3) {
                        playerDiv.classList.add('middle-between');
                        left.appendChild(playerDiv);
                    }
                } else if (myIndex === 3) {
                    if (index === 0) {
                        playerDiv.classList.add('top');
                        left.appendChild(playerDiv);
                    } else if (index === 1) {
                        playerDiv.classList.add('middle-left');
                        top.appendChild(playerDiv);
                    } else if (index === 2) {
                        playerDiv.classList.add('middle-right');
                        right.appendChild(playerDiv);
                    } else if (index === 3) {
                        playerDiv.classList.add('middle-between');
                    }
                }
                break;
        }
    });


    // Render the client's player at the bottom
    const clientHand = handsClient[`Player ${myIndex + 1}`];
    if (clientHand) {
        const clientDiv = document.createElement('div');
        const clientRowDiv = document.createElement('div');

        clientDiv.className = 'player bottom';
        clientDiv.id = `player-${myIndex + 1}`;
        clientDiv.innerHTML = '<h3 class="names">You</h3>';

        clientRowDiv.className = 'player-row';
        clientRowDiv.dataset.playerIndexClient = myIndex + 1;

        clientHand.forEach((card, index) => {
            const cardContainer = document.createElement('div');
            cardContainer.className = 'card-container';
            cardContainer.dataset.cardIndex = index;

            const back = document.createElement('div');
            back.className = 'back';
            const backImg = document.createElement('img');
            backImg.className = 'card-img';
            backImg.src = 'css/images/back2.jpg';
            back.appendChild(backImg);

            const front = document.createElement('div');
            front.className = 'front';
            const frontImg = document.createElement('img');
            frontImg.className = 'card-img';
            frontImg.src = cardImagesClient[card.filePath];
            front.appendChild(frontImg);

            const backAndFront = document.createElement('div');
            backAndFront.className = 'back-and-front';
            backAndFront.appendChild(back);
            backAndFront.appendChild(front);

            cardContainer.appendChild(backAndFront);
            clientRowDiv.appendChild(cardContainer);
        });

        clientDiv.appendChild(clientRowDiv);
        containerDiv.appendChild(clientDiv);
    } else {
        console.error(`No hand found for the client (Player ${myIndex + 1})`);
    }

    fragment.appendChild(containerDiv);
    playersDiv.appendChild(fragment); // Append all new content at once

    adjustSize(() => {
        adjustCardContainers();

        if (flipChangedCards && turn == myIndex + 1) {
            document.querySelectorAll('.card-container').forEach(cardContainer => {
                const cardIndex = cardContainer.dataset.cardIndex;
                const playerRow = cardContainer.closest('.player-row');
                const playerIndexClient = playerRow.dataset.playerIndexClient;

                if (myIndex + 1 == playerIndexClient) {
                    if (cardsToChange.includes(cardIndex)) {
                        cardContainer.classList.remove('show-front');
                        cardContainer.classList.add('temporary-no-show-front');
                    } else {
                        cardContainer.classList.add('show-front');
                    }
                } else {
                    cardContainer.classList.remove('show-front');
                    cardContainer.classList.remove('temporary-no-show-front');
                }

                if (myIndex + 1 == playerIndexClient) {
                    cardContainer.classList.add('flipped');
                    playerRow.classList.add('flipped');
                }
            });
        }

        if (!flipChangedCards && !newRound) {
            showCurrentPlayerCards(); // Apply the class and handle transitions
        }

        if (showMyCards && newRound) {
            document.querySelectorAll('.card-container').forEach(cardContainer => {
                const cardIndex = cardContainer.dataset.cardIndex;
                const playerRow = cardContainer.closest('.player-row');
                const playerIndexClient = playerRow.dataset.playerIndexClient;

                if (myIndex + 1 == playerIndexClient) {
                    cardContainer.classList.add('flipped');
                    playerRow.classList.add('flipped');
                }

                cardContainer.addEventListener('transitionend', () => {
                    newRound = false;
                    showMyCards = false;
                });
            });
        }
    });

    document.querySelectorAll('.card-container').forEach(cardContainer => {
        cardContainer.addEventListener('click', (event) => {
            const cardIndex = event.currentTarget.dataset.cardIndex;
            const playerIndexClient = event.currentTarget.closest('.player-row').dataset.playerIndexClient;

            if (playerIndexClient - 1 == myIndex && playerIndexClient - 1 == turn) {
                event.currentTarget.classList.toggle('flipped');

                const indexInArray = cardsToChange.indexOf(cardIndex);
                if (indexInArray === -1) {
                    cardsToChange.push(cardIndex);
                } else {
                    cardsToChange.splice(indexInArray, 1);
                }
            }
        });
    });

    document.querySelectorAll('.player-row').forEach(playerRow => {
        playerRow.addEventListener('click', () => {
            const playerIndexClient = playerRow.dataset.playerIndexClient;

            if (myIndex + 1 != playerIndexClient) {
                playerRow.classList.toggle('flipped');
                const isRowFlipped = playerRow.classList.contains('flipped');

                playerRow.querySelectorAll('.card-container').forEach(cardContainer => {
                    cardContainer.classList.toggle('flipped', isRowFlipped);
                });
            }
        });
    });
}






// function adjustCardContainers() {
//     console.log("adjust");
//     const containers = document.querySelectorAll('.card-container');
//     containers.forEach(container => {
//         const img = container.querySelector('.card-img');
//         if (img) {
//             // Adjust container size based on image size
//             container.style.width = `${img.offsetWidth}px`;
//             container.style.height = `${img.offsetHeight}px`;
//         }
//     });

//     // Make the elements visible after adjustment
//     document.querySelectorAll('.card-container, .card-img, .names').forEach(element => {
//         element.style.visibility = 'visible';
//     });
//     animate = true;
//     document.querySelectorAll('.card-container').forEach(cardContainer => {
//         const cardIndex = cardContainer.dataset.cardIndex;
//         const playerRow = cardContainer.closest('.player-row');
//         const playerIndexClient = playerRow.dataset.playerIndexClient;
    
//         if (playerIndexClient - 1 == turn) {
//             cardContainer.classList.add('special-effect');
//             playerRow.classList.add('special-effect');
//         }
//     });
// //     const playerRows = document.querySelectorAll('.player-row');

// // // Select the specific player-row by index (e.g., the second player-row)
// // const specificPlayerRow = playerRows[1]; // Index 1 corresponds to the second .player-row

// // // Add the special-effect class to it
// // specificPlayerRow.classList.add('special-effect');
// }

// function adjustSize(callback) {
//     const images = document.querySelectorAll('.card-img');
//     console.log("size");

//     // Initially hide elements
//     images.forEach(img => img.style.visibility = 'hidden');
//     document.querySelectorAll('.names').forEach(nameElement => nameElement.style.visibility = 'hidden');
//     document.querySelectorAll('.card-container').forEach(container => container.style.visibility = 'hidden');

//     if (images.length > 0) {
//         // Get the computed width of the first image
//         const imageWidth = images[0].clientWidth;
//         const imageHeight = images[0].clientHeight;
//         console.log(imageWidth);
//         // Define the gap as a proportion of the image width
//         const gapProportion = 0.5; // 50% of image width for the gap
//         const marginProportion = 0.7;
//         // Calculate the actual gap value
//         const gap = imageWidth * gapProportion;

//         if (players_no === 4) {
//             const player1 = document.getElementById('player-1');
//             if (player1) {
//                 //player1.style.marginBottom = `${marginProportion * imageHeight}px`;
//             }
//         }

//         if (players_no === 3) {
//             const middleRow = document.getElementById('middle-row');
//             if (middleRow) {
//                 middleRow.style.marginTop = `${0.7 * imageHeight}px`;
//             }
//         }

//         if (players_no === 2 && myIndex === 0) {
//             const player2 = document.getElementById('player-2');
//             if (player2) {
//                 player2.style.marginBottom = `${imageHeight}px`;
//             }
//         }
//         else if (players_no === 2 && myIndex === 1) {
//             const player2 = document.getElementById('player-1');
//             if (player2) {
//                 player2.style.marginBottom = `${imageHeight}px`;
//             }
//         }

//         // Adjust the size of player rows based on the image dimensions
//         const playerRows = document.querySelectorAll('.player-row');
//     }

//     let loadedCount = 0;

//     images.forEach((img) => {
//         img.onload = () => {
//             loadedCount++;
//             if (loadedCount === images.length) {
//                 if (callback) callback();
//             }
//         };
//         // If the image is already loaded
//         if (img.complete) {
//             img.onload(); // Call the onload function
//         }
//     });

//     // Call callback directly if images are already loaded
//     if (loadedCount === images.length) {
//         if (callback) callback();
//     }
// }

// // Debounce function to limit the rate at which adjustSize is called
// function debounce(func, wait) {
//     let timeout;
//     return function(...args) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func.apply(this, args), wait);
//     };
// }

// // Attach resize event listener with debounce
// window.addEventListener('resize', debounce(() => {
//     adjustSize(() => {
//         // Ensure the size adjustments are made after resize
//         adjustCardContainers();
//     });
// }, 200));

function adjustCardContainers() {
    console.log("adjust");
    const containers = document.querySelectorAll('.card-container');
    containers.forEach(container => {
        const img = container.querySelector('.card-img');
        if (img) {
            // Adjust container size based on image size
            container.style.width = `${img.offsetWidth}px`;
            container.style.height = `${img.offsetHeight}px`;
        }
    });

    // Ensure the elements are visible after adjustment
    document.querySelectorAll('.card-container, .card-img, .names').forEach(element => {
        element.style.visibility = 'visible';
    });

    animate = true;
    const valuesToCheck = [turn, passed]; // Include 'turn' and 'passed' in the array
    // Apply special effect class based on the current turn
    document.querySelectorAll('.card-container').forEach(cardContainer => {
        const cardIndex = cardContainer.dataset.cardIndex;
        const playerRow = cardContainer.closest('.player-row');
        const playerIndexClient = playerRow.dataset.playerIndexClient;
    
        // Convert playerIndexClient to a number
        const playerIndex = parseInt(playerIndexClient, 10);
    
        if (playerIndexClient - 1 === turn) {
            // Apply special effect if playerIndexClient - 1 matches 'turn'
            cardContainer.classList.add('special-effect');
            playerRow.classList.add('special-effect');
        } else if (passed.includes(playerIndexClient - 1)) {
            // Center the icon if playerIndexClient - 1 is in the 'passed' array
            centerIconInPlayerRow(playerRow);
        }
    });
}

function adjustSize(callback) {
    const images = document.querySelectorAll('.card-img');
    console.log("size");

    // Initially hide elements
    images.forEach(img => img.style.visibility = 'hidden');
    document.querySelectorAll('.names').forEach(nameElement => nameElement.style.visibility = 'hidden');
    document.querySelectorAll('.card-container').forEach(container => container.style.visibility = 'hidden');

    if (images.length > 0) {
        // Get the computed width and height of the first image
        const imageWidth = images[0].clientWidth;
        const imageHeight = images[0].clientHeight;
        console.log(imageWidth);

        // Define the gap and margin as proportions of the image dimensions
        const gapProportion = 0.5; // 50% of image width for the gap
        const marginProportion = 0.7;

        // Calculate the actual gap and margin values
        const gap = imageWidth * gapProportion;

        // if (players_no === 4) {
        //     const player1 = document.getElementById('player-1');
        //     if (player1) {
        //         //player1.style.marginBottom = `${marginProportion * imageHeight}px`;
        //     }
        // }

        // if (players_no === 3) {
        //     const middleRow = document.getElementById('middle-row');
        //     if (middleRow) {
        //         middleRow.style.marginTop = `${0.7 * imageHeight}px`;
        //     }
        // }
        if (players_no === 3) {
            const middleRow = document.getElementById('middle');
            middleRow.style.marginTop = `${0.7 * imageHeight}px`;
            const player = document.getElementById(`player-${myIndex + 1}`);
            player.style.marginBottom = `22px`;
            player.style.marginTop = `auto`;
            
        }
        if (numPlayers === 2) {
            // const player2 = document.getElementById(`player-${myIndex === 0 ? 2 : 1}`);
            // if (player2) {
            //     //player2.style.marginBottom = `${imageHeight}px`;
            // }
            const player = document.getElementById(`player-${myIndex + 1}`);
            player.style.marginBottom = `22px`;
            
        }

        // Adjust the size of player rows based on the image dimensions
        const playerRows = document.querySelectorAll('.player-row');
    }

    let loadedCount = 0;

    images.forEach((img) => {
        img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length && callback) {
                callback();
            }
        };
        // If the image is already loaded
        if (img.complete) {
            img.onload(); // Call the onload function
        }
    });

    // Call callback directly if images are already loaded
    if (loadedCount === images.length && callback) {
        callback();
    }
}

// Debounce function to limit the rate at which adjustSize is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Attach resize event listener with debounce
window.addEventListener('resize', debounce(() => {
    adjustSize(() => {
        // Ensure the size adjustments are made after resize
        adjustCardContainers();
    });
}, 200));

function startGame() {
    socket.emit('start', room);
}
document.getElementById('chip').addEventListener('click', function() {
    if(users_no > 1 && !startReq) {
        socket.emit('start game', room, myName);
        startReq = true;
        document.getElementById('chip').textContent = "WAIT FOR ANOTHER PLAYER'S DECISION"
    }
});

// document.querySelectorAll('.card-container').forEach(cardContainer => {
//     cardContainer.addEventListener('click', (event) => {
//         // Get the clicked card container and find the closest player row for this card
//         const clickedCardContainer = event.currentTarget;
//         const playerRow = clickedCardContainer.closest('.player-row');
//         const playerIndexClient = playerRow.dataset.playerIndexClient;
//         console.log(myIndex, playerIndexClient, turn);
//         // Check if this is the client's row
//         if (myIndex + 1 == playerIndexClient && myIndex == turn) {
//             // For the client's row: flip only the clicked card
//             clickedCardContainer.classList.toggle('flipped');

//             // Convert cardIndex to a number using the unary + operator
//             const cardIndex = +clickedCardContainer.dataset.cardIndex;
//             const cardValue = handsClient[`Player ${playerIndexClient}`][cardIndex].value;

//             // Check if the cardIndex is already in the cardsToChange array
//             const indexInArray = cardsToChange.indexOf(cardIndex);
//             if (indexInArray === -1) {
//                 // If not, add it to the array
//                 cardsToChange.push(cardIndex);
//             } else {
//                 // If it is, remove it from the array
//                 cardsToChange.splice(indexInArray, 1);
//             }
//             console.log("playerIndexClient", playerIndexClient);
//             console.log(`Row Index: ${playerIndexClient}, Card Index: ${cardIndex}, Card Value: ${cardValue}`);
//             console.log("change", cardsToChange);
//             console.log(clickedCardContainer);
//         } else {
//             // For other rows: flip all cards in the row
//             playerRow.classList.toggle('flipped');
            
//             // Get the current state of the row
//             const isRowFlipped = playerRow.classList.contains('flipped');
            
//             // Toggle the 'flipped' class on all card containers in the row
//             playerRow.querySelectorAll('.card-container').forEach(card => {
//                 card.classList.toggle('flipped', isRowFlipped);
//             });
//         }
//     });
    
// });
function changeCards() {
    console.log(cardsToChange);
    flipChangedCards = true;
    if (turn == myIndex) socket.emit('change cards', room, myIndex, cardsToChange);
}
function pass() {
    if (turn == myIndex) {
        socket.emit('pass', room, myIndex);
        myBank = 10;
        //socket.emit('change cards', room, myIndex, cardsToChange);
        lastValidValue = null;
        let betMessage = 'pass';
        socket.emit('bet', room, myIndex, betMessage, lastValidValue)
    }
}



function showCurrentPlayerCards() {
    const cardContainers = document.querySelectorAll('.card-container');
    cardContainers.forEach(cardContainer => {
        const cardIndex = cardContainer.dataset.cardIndex;
        const playerRow = cardContainer.closest('.player-row');
        const playerIndexClient = playerRow.dataset.playerIndexClient;

        if (playerIndexClient == myIndex + 1) {
            cardContainer.classList.add('show-front');
            console.log(`Card ${cardIndex} is now showing front (not in cardsToChange)`);
        } else {
            cardContainer.classList.remove('show-front');
        }
    });

    onCardVisibilityUpdateComplete(); // Directly call the callback
}

function onCardVisibilityUpdateComplete() {
    console.log('Card visibility update complete.');
    const cardContainers = document.querySelectorAll('.card-container');

    cardContainers.forEach(cardContainer => {
        const cardIndex = cardContainer.dataset.cardIndex;
        const playerRow = cardContainer.closest('.player-row');
        const playerIndexClient = playerRow.dataset.playerIndexClient;

        // Remove the show-front class to remove the transition: none
        cardContainer.classList.remove('show-front');

        // Force reflow (this is a trick to ensure that the style changes are applied immediately)
        void cardContainer.offsetWidth;

        // Reapply the class to add the transition back
        if (parseInt(playerIndexClient) === myIndex + 1) {
            cardContainer.style.transition = 'transform 0.6s';
            cardContainer.classList.add('flipped'); // Add the class that will trigger the transition
            console.log(`Card ${cardIndex} for player ${playerIndexClient} is now showing front again with transition.`);
        }
    });
}


// let initialValue = 2;
// let myBank = 10; // example value

// Set the value and min/max attribute of input to initialValue when the page loads
let initialValue = 2;
        let myBank = 10; // example value

        // Set the value and min/max attribute of input to initialValue when the page loads
        window.onload = function() {
            const inputElement = document.getElementById("inputValue");
            inputElement.value = 30;
            //updateMinMax(30, 40);
        }

        function updateMinMax(newMin, newMax) {
            const inputElement = document.getElementById("inputValue");

            // Update the min and max attributes
            inputElement.setAttribute("min", newMin);
            inputElement.setAttribute("max", newMax);

            // Validate and enforce the current value within the new bounds
            validateInputWithinBounds(inputElement);
        }

        function validateInputWithinBounds(inputElement) {
            let inputValue = parseInt(inputElement.value, 10);
            const minValue = parseInt(inputElement.getAttribute("min"), 10);
            const maxValue = parseInt(inputElement.getAttribute("max"), 10);

            // Ensure the value is within bounds
            if (inputValue < minValue) {
                inputElement.value = minValue;
            } else if (inputValue > maxValue) {
                inputElement.value = maxValue;
            }
        }

        // Add event listener for manual input
        document.getElementById("inputValue").addEventListener('input', function() {
            validateInputWithinBounds(this);
        });
    function submitValue() {
        //validateInput();
        const inputElement = document.getElementById("inputValue");
        const inputValue = parseInt(inputElement.value) || 0;
        result = inputValue;
        lastValidValue = result;
        //updateResult();
        console.log(lastValidValue);
        let betMessage = '';
        // if (!call && !raise) {
        //     betMessage = 'bet';    
        // }
        // else if (call && !raise) {
        //     betMessage = 'call';
        // }
        // else if (!call && raise) {
        //     betMessage = 'raise';
        // }
        Ibet = true;
        if (currentBet < lastValidValue) {
            Myraise = lastValidValue - currentBet;
            console.log("check2", Myraise ,lastValidValue, currentBet);
        }
        // else if (OppoRaise > 0) {
        //     Myraise = lastValidValue - OppoRaise;
        //     console.log("check2", Myraise ,lastValidValue, OppoRaise)
        // }
        socket.emit('bet', room, myIndex, betMessage, lastValidValue)
    }

//  function updateResult() {
//      document.getElementById("result").textContent = "Result: " + result;
//  }

    // Attach input event listener to validate input on change
    // document.getElementById("inputValue").addEventListener("input", function() {
    //     //validateInput();
    //     logValueChange();
    // });

    function logValueChange() {
    const inputElement = document.getElementById("inputValue");
    const currentValue = parseInt(inputElement.value) || 0;
    if (currentValue > initialValue) {
        console.log(`Input value increased: ${currentValue}`);
        lastValidValue = currentValue; // Update the last valid value after logging
        call = false;
        raise = true;
        
        document.getElementById('submitBet').textContent = 'RAISE';
    }
    if (currentValue == initialValue) {
        console.log(`Input value not change: ${currentValue}`);
        lastValidValue = currentValue; // Update the last valid value after logging
        raise = false;
        call = true;
        document.getElementById('submitBet').textContent = 'CALL';
    }
    console.log(myBank - currentValue);
}
 
         // Function to log changes in value if the new value is higher
//     // Define a function that will be executed for each value in the array
// function centerIconForValues(cardContainers, values) {
//     cardContainers.forEach(cardContainer => {
//         const cardIndex = cardContainer.dataset.cardIndex;
//         const playerRow = cardContainer.closest('.player-row');
//         const playerIndexClient = playerRow.dataset.playerIndexClient;

//         // Convert playerIndexClient to a number if it is not already
//         const playerIndex = parseInt(playerIndexClient, 10);

//         // Check if the playerIndexClient - 1 is in the array of values
//         if (values.includes(playerIndex - 1)) {
//             // Optionally add a special effect or other styles here
//             // cardContainer.classList.add('special-effect');
//             // playerRow.classList.add('special-effect');

//             // Center the icon in the player row
//             centerIconInPlayerRow(playerRow);
//         }
//     });
// }

// // Define the values array


// Function to center the icon in the player row
function centerIconInPlayerRow(element) {
    // Create the <i> element
    const iconElement = document.createElement('i');
    
    // Add the desired class to the <i> element
    iconElement.classList.add('icon-cancel-circled2'); // Example: FontAwesome arrow-down icon

    // Style the <i> element to be centered
    iconElement.style.position = 'absolute';
    iconElement.style.top = '50%';
    iconElement.style.left = '50%';
    iconElement.style.transform = 'translate(-50%, -50%)';
    iconElement.style.fontSize = '50px'; // Example font size
    iconElement.style.color = 'red'; // Example color

    // Ensure the parent element has a position context
    element.style.position = 'relative';
    element.style.width = '100%'; // Ensure the parent element has width and height
    element.style.height = '100%'; // Ensure the parent element has width and height

    // Clear existing content (optional)
    // while (element.firstChild) {
    //     element.removeChild(element.firstChild);
    // }

    // Append the <i> element to the .player-row
    element.appendChild(iconElement);
}
function setBankWidth() {
    // Select all elements with class 'name' inside '#playersBank' and '#myBank'
    const playersBankNames = document.querySelectorAll('#playersBank .name');
    const myBankNames = document.querySelectorAll('#myBank .name');

    console.log("Number of elements selected in #playersBank:", playersBankNames.length);
    console.log("Number of elements selected in #myBank:", myBankNames.length);

    // If no elements are found in either bank, log and exit
    if (playersBankNames.length === 0 && myBankNames.length === 0) {
        console.log("No .name elements found in #playersBank or #myBank.");
        return; // Exit if no elements found
    }

    // Clear previous widths to ensure recalculation is accurate
    clearPreviousWidths(playersBankNames, myBankNames);

    // Calculate the maximum width across both #playersBank and #myBank
    let maxWidth = 0;
    
    // Check widths in #playersBank
    playersBankNames.forEach(element => {
        const width = element.offsetWidth;
        console.log("Element width in #playersBank:", width);
        if (width > maxWidth) {
            maxWidth = width;
        }
    });

    // Check widths in #myBank
    myBankNames.forEach(element => {
        const width = element.offsetWidth;
        console.log("Element width in #myBank:", width);
        if (width > maxWidth) {
            maxWidth = width;
        }
    });

    console.log("Max width calculated for both banks:", maxWidth);

    // Apply the maximum width to all elements in #playersBank
    playersBankNames.forEach(element => {
        console.log("Setting width for element in #playersBank:", element);
        element.style.width = maxWidth + 'px';
        console.log("Updated width to:", maxWidth);
    });

    // Apply the maximum width to all elements in #myBank
    myBankNames.forEach(element => {
        console.log("Setting width for element in #myBank:", element);
        element.style.width = maxWidth + 'px';
        console.log("Updated width to:", maxWidth);
    });
}

function clearPreviousWidths(playersBankNames, myBankNames) {
    // Clear previous widths to allow for accurate recalculation
    playersBankNames.forEach(element => {
        element.style.width = ''; // Clear previous width
    });

    myBankNames.forEach(element => {
        element.style.width = ''; // Clear previous width
    });
}

function updateUI() {
    // Use requestAnimationFrame to ensure DOM is fully updated
    requestAnimationFrame(() => {
        setTimeout(() => {
            setBankWidth();
        }, 100); // Delay to ensure DOM is updated
    });
}


document.getElementById('submitBet').addEventListener('click', function() {
    let inputValue = document.getElementById('inputValue').value;

    // Convert to a number
    let numericValue = parseFloat(inputValue);

    // Handle the numeric value as needed
    console.log("Bet value:", numericValue);

    // Optionally reset the input field
    document.getElementById('inputValue').value = numericValue;
});
