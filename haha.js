let vocabList = JSON.parse(localStorage.getItem("vocabList")) || [];
let learningVocab = JSON.parse(localStorage.getItem("learningVocab")) || [];
let learnedVocab = JSON.parse(localStorage.getItem("learnedVocab")) || [];
let currentIndex = 0;
let currentType = "new";

function addVocabulary() {
  let vocabInput = document.getElementById("vocab-input");
  let meaningInput = document.getElementById("meaning-input");
  let newWord = vocabInput.value.trim();
  let meaning = meaningInput.value.trim();

  if (newWord && meaning) {
    vocabList.push({ word: newWord, meaning: meaning });
    updateVocabularyLists();
    vocabInput.value = "";
    meaningInput.value = "";
  }
}

function updateVocabularyLists() {
  document.getElementById("new-count").textContent = `${vocabList.length} từ`;
  document.getElementById(
    "learning-count"
  ).textContent = `${learningVocab.length} từ`;
  document.getElementById(
    "learned-count"
  ).textContent = `${learnedVocab.length} từ`;

  localStorage.setItem("vocabList", JSON.stringify(vocabList));
  localStorage.setItem("learningVocab", JSON.stringify(learningVocab));
  localStorage.setItem("learnedVocab", JSON.stringify(learnedVocab));
}

function openFlashcard(type) {
  currentType = type;
  let flashcards = getFlashcardsByType(type);

  if (flashcards.length > 0) {
    currentIndex = 0;
    document.getElementById("main-page").style.display = "none";
    document.getElementById("flashcard-page").style.display = "block";
    showFlashcard();
  }
}

function getFlashcardsByType(type) {
  if (type === "new") return vocabList;
  if (type === "learning") return learningVocab;
  return [];
}

function showFlashcard() {
  let flashcards = getFlashcardsByType(currentType);
  if (flashcards.length > 0 && currentIndex < flashcards.length) {
    let currentVocab = flashcards[currentIndex];
    document.getElementById("vocab-word").textContent = currentVocab.word;
    document.getElementById("vocab-meaning").textContent = currentVocab.meaning;

    let flashcard = document.getElementById("flashcard");
    flashcard.classList.add("show-front");
    flashcard.classList.remove("show-back");

    flashcard.onclick = function () {
      if (flashcard.classList.contains("show-front")) {
        flashcard.classList.remove("show-front");
        flashcard.classList.add("show-back");
      } else {
        flashcard.classList.remove("show-back");
        flashcard.classList.add("show-front");
      }
    };
  }
}

function nextFlashcard() {
  let flashcards = getFlashcardsByType(currentType);
  if (currentIndex < flashcards.length - 1) {
    currentIndex++;
    showFlashcard();
  } else {
    alert("Đã hết flashcard.");
  }
}

function prevFlashcard() {
  if (currentIndex > 0) {
    currentIndex--;
    showFlashcard();
  } else {
    alert("Đây là thẻ đầu tiên.");
  }
}

function markLearned() {
  if (currentType === "learning") {
    let currentVocab = learningVocab.splice(currentIndex, 1)[0];
    learnedVocab.push(currentVocab);
  } else if (currentType === "new") {
    let currentVocab = vocabList.splice(currentIndex, 1)[0];
    learnedVocab.push(currentVocab);
  }
  updateVocabularyLists();
  adjustIndexAndShowNext();
}

function markLearning() {
  if (currentType === "new") {
    let currentVocab = vocabList.splice(currentIndex, 1)[0];
    learningVocab.push(currentVocab);
    updateVocabularyLists();
    adjustIndexAndShowNext();
  }
}

function adjustIndexAndShowNext() {
  let flashcards = getFlashcardsByType(currentType);
  if (currentIndex >= flashcards.length) {
    currentIndex = flashcards.length - 1;
  }
  if (flashcards.length > 0) {
    showFlashcard();
  } else {
    goBack();
  }
}

function viewLearnedWords() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("learned-page").style.display = "block";

  let learnedList = document.getElementById("learned-list");
  learnedList.innerHTML = "";

  learnedVocab.forEach((item) => {
    let li = document.createElement("li");
    li.textContent = `${item.word}: ${item.meaning}`;
    learnedList.appendChild(li);
  });
}

function goBack() {
  document.getElementById("main-page").style.display = "block";
  document.getElementById("flashcard-page").style.display = "none";
  document.getElementById("learned-page").style.display = "none";
  document.getElementById("matching-page").style.display = "none";
}

function startMatching() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("matching-page").style.display = "block";
  generateMatchingGame();
}

function generateMatchingGame() {
  let matchingContainer = document.getElementById("matching-container");
  matchingContainer.innerHTML = "";

  let allWords = [...learnedVocab];
  let shuffled = allWords.sort(() => Math.random() - 0.5);
  let words = shuffled.map((item) => ({ type: "word", text: item.word }));
  let meanings = shuffled.map((item) => ({
    type: "meaning",
    text: item.meaning,
  }));

  let items = [...words, ...meanings].sort(() => Math.random() - 0.5);
  let selectedItems = [];

  items.forEach((item) => {
    let div = document.createElement("div");
    div.className = "matching-item";
    div.textContent = item.text;
    div.dataset.type = item.type;
    div.dataset.text = item.text;

    div.addEventListener("click", () => {
      if (selectedItems.length < 2 && !div.classList.contains("selected")) {
        div.classList.add("selected");
        selectedItems.push(div);

        if (selectedItems.length === 2) {
          checkMatch(selectedItems);
        }
      }
    });

    matchingContainer.appendChild(div);
  });
}

function checkMatch(selectedItems) {
  let [first, second] = selectedItems;

  let firstText = first.dataset.text;
  let secondText = second.dataset.text;

  let match = false;
  for (let vocab of learnedVocab) {
    if (
      (firstText === vocab.word && secondText === vocab.meaning) ||
      (firstText === vocab.meaning && secondText === vocab.word)
    ) {
      match = true;
      break;
    }
  }

  if (match) {
    first.style.backgroundColor = "#4caf50";
    second.style.backgroundColor = "#4caf50";
    setTimeout(() => {
      first.style.visibility = "hidden";
      second.style.visibility = "hidden";
    }, 1000);
  } else {
    first.style.backgroundColor = "#ff5733";
    second.style.backgroundColor = "#ff5733";
    setTimeout(() => {
      first.classList.remove("selected");
      second.classList.remove("selected");
      first.style.backgroundColor = "#e0e0e0";
      second.style.backgroundColor = "#e0e0e0";
    }, 1000);
  }

  setTimeout(() => {
    selectedItems.length = 0;
  }, 1000);
}

function resetApplication() {
  if (confirm("Bạn có chắc muốn đặt lại toàn bộ dữ liệu không?")) {
    vocabList = [];
    learningVocab = [];
    learnedVocab = [];
    updateVocabularyLists();
    alert("Dữ liệu đã được đặt lại!");
  }
}

function endGame() {
  alert("Kết thúc trò chơi! Bạn đã hoàn thành bài luyện tập.");
  goBack();
}
function scheduleNotification() {
  const title = document.getElementById("notification-title").value;
  const body = document.getElementById("notification-body").value;
  const time = document.getElementById("notification-time").value;

  if (!title || !body || !time) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const delay = new Date(time) - new Date(); // Tính thời gian chờ

  if (delay < 0) {
    alert("Thời gian phải ở tương lai!");
    return;
  }

  // Kiểm tra Service Worker
  if (!navigator.serviceWorker || !navigator.serviceWorker.controller) {
    alert("Service Worker chưa được kích hoạt hoặc không kiểm soát trang này.");
    return;
  }

  // Gửi thông điệp tới Service Worker
  navigator.serviceWorker.controller.postMessage({
    type: "scheduleNotification",
    title: title,
    body: body,
    delay: delay,
  });

  alert("Đã đặt lịch gửi thông báo!");
}
