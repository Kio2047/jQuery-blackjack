//  All sounds used are royalty-free and from zapsplat.com: https://www.zapsplat.com/

// Initialize background music and sound effect variables
let $jazzMusic = $("<audio>").prop("src", "audio/background.mp3").prop("volume", 0.5).appendTo("body");
let $winSound = $("<audio>").prop("src", "audio/win.mp3").appendTo("body");
let $loseSound = $("<audio>").prop("src", "audio/lose.mp3").appendTo("body");
let $buttonSound = $("<audio>").prop("src", "audio/button.mp3").appendTo("body");
let $playerCardSound = $("<audio>").prop("src", "audio/card.mp3").appendTo("body");
let $dealerCardSound = $("<audio>").prop("src", "audio/card.mp3").appendTo("body");
let $blackjackSound = $("<audio>").prop("src", "audio/blackjack.mp3").appendTo("body");
let $drawSound = $("<audio>").prop("src", "audio/draw.mp3").appendTo("body");

// Create function for drawing cards from deck
const draw = deck => {
  let cardIndex = Math.floor(Math.random()*(deck.length));
  return deck.splice(cardIndex, 1)[0];
}

// Create function which calculates the value of a single card
const getCardValue = str => {
  let numbers = /^[0-9]+/
  if (numbers.test(str)) {
    return parseInt(str.match(numbers))
  }
  else if (str[0] !== "A") {
    return 10;
  }
  else {
    return 11;
  }
}

// Create function to map card string to parameters for card image
const cardCreator = str => {
  let isLetter = /[A-Z]/;
  let rankLower = str[0];
  let rankUpper = str[0];

  if (isLetter.test(rankLower)) {
    rankLower = str[0].toLowerCase();
  }

  let suit = str[1];

  if (str.length === 3) {
    rankLower = "10";
    rankUpper = "10";
    suit = str[2];
  }

  switch (suit) {
    case "S":
      suit = "spades";
      break;
    case "D":
      suit = "diams";
      break;
    case "H":
      suit = "hearts";
      break;
    case "C":
      suit = "clubs";
      break;
  }

  return `<div class="card rank-${rankLower} ${suit}">
  <span class="rank">${rankUpper}</span>
  <span class="suit">&${suit};</span>
  </div>`

}

// Create function for adding card to dealer deck
const addDealerCard = card => {
  $(card).addClass("dealer-card").appendTo($dealerHand).animate({
    left: '0px',
    top: '0px',
  }, 600);
  $dealerCardSound[0].play()
}

// Create function for adding card to player deck
const addPlayerCard = card => {
  $(card).addClass("player-card").appendTo($playerHand).animate({
    left: '0px',
    top: '0px',
  }, 600);
    $playerCardSound[0].play()
}

// Find hand/value divs of the dealer/player
let $dealerHand = $("#dealer-hand");
let $playerHand = $("#player-hand");
let $dealerValue = $("#dealer-value");
let $playerValue = $("#player-value");

// Create button for starting new round and hide other buttons
let $newRoundButton = $("#new-round-button").css("font-family", "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif")
$("#hit").hide();
$("#stand").hide();
$newRoundButton.hide();

// Create function for starting new round
const startNewRound = () => {

  $dealerValue.hide()
  $playerValue.hide()
  $playerHand.html("");
  $dealerHand.html("");

  $("#hit").hide();
  $("#stand").hide();
  $newRoundButton.hide()
  $("#result").text("");

  // Create card deck in array format
  let deckArr = ["2H","3H","4H","5H","6H","7H","8H","9H","10H","JH","QH","KH","AH","2D","3D","4D","5D","6D","7D","8D","9D","10D","JD","QD","KD","AD","2S","3S","4S","5S","6S","7S","8S","9S","10S","JS","QS","KS","AS","2C","3C","4C","5C","6C","7C","8C","9C","10C","JC","QC","KC","AC"];

  // Create dealer and player hand variables and populate with cards from the deck
  let dealerCardsStr = [draw(deckArr), draw(deckArr)];
  let playerCardsStr = [draw(deckArr), draw(deckArr)];

  let dealerCards = [cardCreator(dealerCardsStr[0]), cardCreator(dealerCardsStr[1])];
  let playerCards = [cardCreator(playerCardsStr[0]), cardCreator(playerCardsStr[1])];

  // Deal cards to dealer/player
  addDealerCard(dealerCards[0]);
  setTimeout(function() { addPlayerCard(playerCards[0]) }, 500);
  setTimeout(function() { addDealerCard('<div class="card back">*</div>') }, 1000);
  setTimeout(function() { addPlayerCard(playerCards[1]) }, 1500);

  // Create dealer and player hand value variables and calculate from initial hands and show value of player hand
  let dealerValue = getCardValue(dealerCardsStr[0]) + getCardValue(dealerCardsStr[1]);
  let playerValue = getCardValue(playerCardsStr[0]) + getCardValue(playerCardsStr[1]);
  setTimeout(function() {
    $playerValue.text("Player: " + playerValue);
    $playerValue.show(400);
  }, 2100);

   // Show hit/stand buttons if player doesn't get Blackjack
   if (playerValue !== 21) {
    $("#hit").delay(2100).show(0);
    $("#stand").delay(2100).show(0);
    setTimeout(function() {
      $dealerValue.text("Dealer: ?")
      $dealerValue.show(400);
    }, 2100);
  }

  // Show dealer hand if player gets Blackjack
  if (playerValue === 21) {
    setTimeout(function() {
      $dealerValue.text("Dealer: " + dealerValue)
      $dealerValue.show(400);
    }, 2100);
  }

  // Count the number of aces in dealer and player hands
  let aceSearcher = /[A]/g;
  let dealerAceCount = aceSearcher.test(dealerCardsStr.join("")) ? dealerCardsStr.join("").match(aceSearcher).length : 0;
  let playerAceCount = aceSearcher.test(playerCardsStr.join("")) ? playerCardsStr.join("").match(aceSearcher).length : 0;

  // Update player hand value, accounting for the ability to change ace value if 21 is exceeded (repeatedly turn ace values into 1 while hand value is over 21)
  while (dealerValue > 21 && dealerAceCount > 0) {
    playerValue -= 10;
    playerAceCount--;
  }
  while (playerValue > 21 && playerAceCount > 0) {
    playerValue -= 10;
    playerAceCount--;
  }

  // End round if player has Blackjack
  if (playerValue === 21 && dealerValue === 21) {
    setTimeout(function() {
      $(".back").fadeOut(600);
      let coordinates = $(".back")[0].getBoundingClientRect();
      let $revealedCard = $(dealerCards[1]).attr("id", "hidden-dealer-card").css("top", coordinates.y).css("left", coordinates.x).appendTo($dealerHand);
            setTimeout(function() {
        $revealedCard.removeClass("hidden-dealer-card").css("position", "relative").css("left", "0px").css("top", "0px");
      }, 600);
      $blackjackSound[0].play();
      $drawSound[0].play();
      $("#hit").hide();
      $("#stand").hide();
      $("#result").text("Blackjack! It's a tie!");
      $newRoundButton.show();
      }, 2100);
    return;
  }

  else if (playerValue === 21) {
    setTimeout(function() {
      $(".back").fadeOut(600);
      let coordinates = $(".back")[0].getBoundingClientRect();
      let $revealedCard = $(dealerCards[1]).attr("id", "hidden-dealer-card").css("top", coordinates.y).css("left", coordinates.x).appendTo($dealerHand);
      setTimeout(function() {
        $revealedCard.removeClass("hidden-dealer-card").css("position", "relative").css("left", "0px").css("top", "0px");
      }, 600);
      $blackjackSound[0].play();
      $winSound[0].play();
      $("#hit").hide();
      $("#stand").hide();
      $("#result").text("Blackjack! You win!");
      $newRoundButton.show();
      }, 2100);
    return;
  }

  // Create event listener and function for hit button
  $("#hit").on("click", function() {
    $buttonSound[0].play();

    // Draw new card and add to player hand
    let newCard = draw(deckArr);
    addPlayerCard(cardCreator(newCard));

    // Increase player ace count if necessary
    if (aceSearcher.test(newCard)) {
      playerAceCount++;
    }

    // Update player hand value, accounting for the ability to change ace value if 21 is exceeded (repeatedly turn ace values into 1 while hand value is over 21)
    playerValue += getCardValue(newCard);
    while (playerValue > 21 && playerAceCount > 0) {
      playerValue -= 10;
      playerAceCount--;
    }
    $playerValue.text("Player: " + playerValue);

    // Reveal dealer's hand, notify player, and end round if player exceeds 21
    if (playerValue > 21) {
      // Reveal dealer's hand
      let coordinates = $(".back")[0].getBoundingClientRect();
      let $revealedCard = $(dealerCards[1]).attr("id", "hidden-dealer-card").css("top", coordinates.y).css("left", coordinates.x).appendTo($dealerHand);

      setTimeout(function() {
        $(".back").fadeOut(600);
       }, 600);

      setTimeout(function() {
        $revealedCard.removeClass("hidden-dealer-card").css("position", "relative").css("left", "0px").css("top", "0px");
        $dealerValue.text("Dealer: " + dealerValue);
        $("#result").text("Bust! Dealer wins!");
        $loseSound[0].play();
        $newRoundButton.show();
       }, 1200);

      // Hide buttons
      $("#hit").off('click');
      $("#hit").hide();
      $("#stand").hide();
      $("#stand").off("click");
      return;
    }

    // If player hand has a value of 21, trigger stand button automatically
    if (playerValue === 21) {
      $("#stand").trigger("click");
    }

  });

  // Create event listener and function for stand button
  $("#stand").on("click", function() {
    $buttonSound[0].play();
    $("#hit").hide();
    $("#hit").off("click");
    $("#stand").hide();
    $("#stand").off("click");

    // Show dealer's hand
    let coordinates = $(".back")[0].getBoundingClientRect();
    let $revealedCard = $(dealerCards[1]).attr("id", "hidden-dealer-card").css("top", coordinates.y).css("left", coordinates.x).appendTo($dealerHand);
    $dealerValue.text("Dealer: " + dealerValue);
      $(".back").fadeOut(600);
      setTimeout(function() {
        $revealedCard.css("position", "relative").css("left", "0px").css("top", "0px");
       }, 600);

    // Make dealer draw if their hand's value is 16 or under
    let timeCounter = 1;
    let i = 2;
    // let newDealerValues = [];
    let currentValues = [];

    while (dealerValue < 17) {

      let newCard = draw(deckArr);
      // newDealerValues.push(getCardValue(newCard));

      // Increase Dealer ace count if necessary
      if (aceSearcher.test(newCard)) {
        dealerAceCount++;
        }

      // Update dealer hand value, accounting for the ability to change ace value if 21 is exceeded (repeatedly turn ace values into 1 while hand value is over 21)
      dealerValue += getCardValue(newCard);
      while (dealerValue > 21 && dealerAceCount > 0) {
        dealerValue -= 10;
        dealerAceCount--;
      }

      currentValues.push(dealerValue);
      setTimeout(function() {
        addDealerCard(cardCreator(newCard));
        $dealerValue.text("Dealer: " + currentValues[i - 2]);
        i++;
       }, timeCounter*1200);

       timeCounter++;

    }

    // Show result based on final dealer value
    setTimeout(function() {

      if (dealerValue > 21) {
          $("#result").text("Congratulations! You won!");
          $winSound[0].play();
      }

      else if (dealerValue > playerValue) {
          $("#result").text("Dealer wins!");
          $loseSound[0].play();
      }

      else if (playerValue > dealerValue) {
          $("#result").text("Congratulations! You won!");
          $winSound[0].play();
      }

      else {
          $("#result").text("That's a draw!");
          $drawSound[0].play();
      }

      $newRoundButton.show();

     }, (timeCounter) * 1000);

    return;
  });

}


// Need to press a button to start the game or else the background music won't trigger
let playButton = $("<button>").css("font-family", "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif").text("Start game").attr("id", "play").appendTo("#info");
playButton.on("click", function() {
  startNewRound();
  $jazzMusic[0].play();
  $jazzMusic[0].loop = true;
  playButton.hide();
});

$newRoundButton.on("click", startNewRound);



