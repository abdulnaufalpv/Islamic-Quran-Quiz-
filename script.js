// Fetch API and Quiz Logic here as per the original script
    const API_URL = "https://api.alquran.cloud/v1/ayah";
    const SURAH_NAMES_URL = "https://api.alquran.cloud/v1/surah";

    let level = 1, points = 0, questionNumber = 1;
    const questionsPerLevel = 5, usedAyahs = [], optionsContainer = document.querySelector('.options');
    const levelDisplay = document.querySelector('.level'), pointsDisplay = document.querySelector('.points');
    const questionContainer = document.querySelector('.question');
    const hintButton1 = document.querySelectorAll('.hint-button')[0], hintButton2 = document.querySelectorAll('.hint-button')[1];
    let currentAyahData = null, correctWord = "";

    function getSuraRange(level) {
      return level <= 10 ? { start: (level - 1) * 10 + 1, end: level * 10 } : { start: 1, end: 114 };
    }

    async function fetchAyah(sura, ayah) {
      const response = await fetch(`${API_URL}/${sura}/${ayah}`);
      const data = await response.json();
      return data.data;
    }

    async function fetchSuraDetails(suraNumber) {
      const response = await fetch(SURAH_NAMES_URL);
      const data = await response.json();
      return data.data.find(sura => sura.number === suraNumber);
    }

    async function loadQuestion() {
      if (questionNumber > questionsPerLevel) {
        level++;
        questionNumber = 1;
        alert(`Level ${level - 1} completed! Welcome to Level ${level}.`);
      }

      let ayahIdentifier;
      do {
        const { start, end } = getSuraRange(level);
        const suraDetails = await fetchSuraDetails(Math.floor(Math.random() * (end - start + 1)) + start);
        const randomAyah = Math.floor(Math.random() * suraDetails.ayahCount) + 1;
        ayahIdentifier = `${suraDetails.number}:${randomAyah}`;
        if (!usedAyahs.includes(ayahIdentifier)) {
          usedAyahs.push(ayahIdentifier);
          currentAyahData = await fetchAyah(suraDetails.number, randomAyah);
          break;
        }
      } while (true);

      const words = currentAyahData.text.split(' ');
      correctWord = words[Math.floor(Math.random() * words.length)];
      words[words.indexOf(correctWord)] = "______";
      questionContainer.textContent = words.join(' ');

      generateOptions(correctWord, words);
      updateStats();
    }

    function generateOptions(correctWord, words) {
      optionsContainer.innerHTML = "";
      const options = new Set([correctWord]);
      while (options.size < 4) options.add(words[Math.floor(Math.random() * words.length)]);
      [...options].sort(() => Math.random() - 0.5).forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.textContent = option;
        optionElement.className = "option";
        optionElement.onclick = () => {
          if (option === correctWord) {
            optionElement.classList.add("correct");
            points += 5; questionNumber++; loadQuestion();
          } else {
            optionElement.classList.add("wrong");
            points -= 3;
          }
          updateStats();
        };
        optionsContainer.appendChild(optionElement);
      });
    }

    function updateStats() {
      levelDisplay.textContent = `Level: ${level} - Question: ${questionNumber}`;
      pointsDisplay.textContent = `Total Points: ${points}`;
      hintButton1.disabled = points < 3; hintButton2.disabled = points < 5;
    }

    hintButton1.onclick = () => { /* Hint Logic */ };
    hintButton2.onclick = () => { /* Reveal Ayah Logic */ };

    loadQuestion();
