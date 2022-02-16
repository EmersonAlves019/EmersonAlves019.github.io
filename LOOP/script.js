const btnDraw = document.getElementById('wordDraw');
const divAnime = document.getElementById('anime');
const ol = document.getElementById('wordsSaved');
const mainPanel = document.querySelector('.main__panel');

const request = async (url, options = {}) => {
  const result = { headers: null, data: null, success: false };
  try {
    const res = await fetch(url, options);
    result.data = await res.json();
    result.headers = res.headers;
    result.success = res.status === 200;
  } catch (error) {
    result.error = error;
    console.log(result);
  } finally {
    return result;
  }
};

const getWordInfos = async (word) => {
  return await request(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
  );
};

const getUrlPicture = async (word) => {
  return await request(
    `https://pixabay.com/api/?key=25677177-208a1a28b9a9764934ff03282&q=${word}s&image_type=photo`,
  );
};

const getRandomWord = (theme = 'general') => {
  return listOfWords[theme][
    Math.floor(Math.random() * listOfWords[theme].length)
  ];
};

const createCardData = async (newWord) => {
  const randomWord = newWord || getRandomWord('general');
  const wordInfosArr = await getWordInfos(randomWord);
  const picture = await getUrlPicture(randomWord);
  if (!wordInfosArr.success || !picture.success) {
    return (document.querySelector('.c-word__card').innerHTML =
      'OPS! There is a bug! please try again');
  }
  const { data: wordInfos } = wordInfosArr;
  const data = {
    word: randomWord || '',
    audio: wordInfos[0]?.phonetics[0]?.audio || '',
    images: picture.data?.hits || [],
    definition: wordInfos[0]?.meanings[0]?.definitions[0]?.definition || '',
    example: wordInfos[0]?.meanings[0]?.definitions[0]?.example || '',
    synonyms: wordInfos[0]?.meanings[0]?.definitions[0]?.synonyms || [],
    isFilled: true,
  };
  return data;
};

const createImageElements = (arr, word) => {
  return arr
    .slice(0, 15)
    .map(
      ({ largeImageURL }, i) =>
        `<img class="main__img" src="${largeImageURL}" width='200' alt="${word}"/>`,
    )
    .join('');
};

const createSynElement = (arr) => {
  return arr
    .slice(0, 15)
    .map((word) => `<span class="main__synonyms-link">${word}</span>`)
    .join('');
};

const renderCardElement = (options) => {
  if (!options.isFilled) return;
  const { word, audio, images, definition, example, synonyms } = options;
  document.querySelector('.main__panel').innerHTML = `
    <section class='main__panel-left'>
      <div class="main__title-div">
        <span class="main__title-word">The word is:</span>    
        <section class='main__panel-word'>
          <span id="word">${word} </span>
          <button id="save">Save</button>
        </section>
        <audio src="${audio}" controls='true'></audio>
      </div>
      <div class="main__synonyms-div">
        <span class="main__title-synonyms">Synonyms:</span>
        <aside class="main__synonyms" id="synonyms">${createSynElement(
          synonyms,
        )}</aside>
      </div>  
    </section>
    <section class='main__panel-right'>
        <div class='main__definitions'> 
          <h5>${definition}</h5>
          <h6>${example}</h6>
        </div>
        <section class='main__img-collection'>
            ${createImageElements(images, word)}
        </section>
    </section>
      `;
};

const searchByWord = async (word) => {
  const data = await createCardData(word);
  renderCardElement(data);
};

const getSavedWords = (savedWords) => {
  return savedWords?.map((word) => `<li>${word}</li>`).join('');
};

const saveWord = () => {
  const word = document.getElementById('word').innerText;
  const wordsSaved = JSON.parse(localStorage.getItem('words')) || [];
  if (wordsSaved && !wordsSaved?.includes(word)) {
    wordsSaved.push(word);
    localStorage.setItem('words', JSON.stringify(wordsSaved));
    ol.innerHTML = getSavedWords(wordsSaved) || '';
  }
};

const events = {
  synonyms: async (e) => {
    if (e.target.id !== 'synonyms') {
      const text = e.target.innerText;
      await searchByWord(text);
    }
  },

  wordDraw: async () => {
    await searchByWord();
    divAnime.classList.add('load');
    setTimeout(() => divAnime.classList.remove('load'), 1450);
  },

  save: saveWord,

  wordsSaved: async (e) => {
    if (e.target.id !== 'wordsSaved') {
      const text = e.target.innerText;
      searchByWord(text);
    }
  },

  help: () => {
    const gif = document.createElement('video');
    gif.src = 'clips/gif-help.webm';
    gif.controls = true;
    gif.className = 'gif';
    mainPanel.appendChild(gif);
  },
};

window.addEventListener('click', async (e) => {
  if (document.querySelector('.gif')) {
    document.querySelector('.gif').remove();
  }
  if (events[e.target.id]) {
    await events[e.target.id](e);
  }
  if (events[e.target.parentElement.id]) {
    await events[e.target.parentElement.id](e);
  }
});

window.onload = () => {
  ol.innerHTML = getSavedWords(JSON.parse(localStorage.getItem('words'))) || '';
};
