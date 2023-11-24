
 
addToFavorites = (title) => {
  let existing = localStorage.getItem('userFav');
  existing = existing ? JSON.parse(existing) : [];

  if(existing.some(userFavItem => userFavItem.imdbID === title.imdbID)) {
    document.getElementById('favBtn').innerText = 'already favorites'
  } else {
    existing.push(title);
    localStorage.setItem('userFav', JSON.stringify(existing))
    document.getElementById('favBtn').innerText = 'added';
  }
}

checkAndShowMore = () => {
  const a = document.getElementById('result').childNodes;
  const visibleUpto = parseInt(localStorage.visibleLevel)
  a[visibleUpto].style = a[0].style;
  ++localStorage.visibleLevel;


  if(visibleUpto === a.length - 1) {
    document.getElementById('showMore').style.display = 'none';
  }
}

clearFavorites = () => {
  localStorage.removeItem('userFav');
  document.getElementById('result').innerText = 'cleared';
  clearBtn.style.display = 'none';
}

performSearch = async() => {
  document.getElementById('result').innerHTML = '';
  removeAllBtns()
  document.getElementById('result').innerHTML = 'searching';

  const searchString = document.getElementById('searchBar').value;
  if(searchString.length ) {
    const resultArray = [];
    const validSearch = await fetch(`https://omdbapi.com/?s=${searchString}&apikey=9efd73a&type=movie`, {mode: 'cors'});
    const jsonBody = await validSearch.json();
    if(jsonBody.Response === 'True') {
      const maxResults = Math.min(100, jsonBody.totalResults);
      resultArray.push(...jsonBody.Search)
      for(let i = 2; i <= Math.ceil(maxResults / 10); i++) {
        const newRes = await fetch(`https://omdbapi.com/?s=${searchString}&apikey=9efd73a&type=movie&page=${i}`, {mode: 'cors'})
        const jsonNewRes = await newRes.json();
        resultArray.push(...jsonNewRes.Search)
      }
      showResults(resultArray);

    } else {
      document.getElementById('result').innerHTML = 'no found'
    } 
  }
  else {
      document.getElementById('result').innerHTML = 'typing and search'
  }

}

renderFavorites = () => {
  removeAllBtns();

  let userFavData = localStorage.userFav 
  if(!userFavData) {
    document.getElementById('result').innerHTML = 'add favorites';
  } else {
    userFavData = JSON.parse(userFavData);

    showResults(userFavData);
    removeAllBtns();

    const clearBtn = document.getElementById('clearBtn');
    clearBtn.style.display = 'block';

  }
}


retrieveState = () => {
  document.body.innerHTML = localStorage.prevState;
}


removeAllBtns = () => {
  const btns = document.getElementsByClassName('btns');
  for(let i = 0; i < btns.length; i++) {
    btns[i].style.display = 'none';
  }
}

saveState = () => {
  localStorage.setItem('prevState', document.body.innerHTML)
}

showDetails = async (titleID) => {
  // Saves current state in the local storage.
  saveState()

  const titleDetails = await fetch(`https://omdbapi.com/?i=${titleID}&plot=full&apikey=9efd73a`, { mode: 'cors' })
  const tdjson = await titleDetails.json()
  const resDiv = document.getElementById('result')
  resDiv.innerHTML = ''
  const poster = document.createElement('IMG')
  if (tdjson.Poster === 'N/A') {
    poster.setAttribute('src', 'https://raw.githubusercontent.com/IamRaviTejaG/MovieWiki/master/images/noimg.jpg')
  } else {
    poster.setAttribute('src', `${tdjson.Poster}`)
  }
  poster.setAttribute('height', '300px')
  poster.style.display = 'block'
  resDiv.appendChild(poster)
  const newDiv = document.createElement('DIV')
  newDiv.setAttribute('class', 'titleDetails')
  const titleP = document.createElement('P')
  titleP.innerHTML = `<b>TITLE</b>: ${tdjson.Title}`
  newDiv.appendChild(titleP)
  const releasedP = document.createElement('P')
  releasedP.innerHTML = `<b>RELEASED</b>: ${tdjson.Released}`
  newDiv.appendChild(releasedP)
  const castP = document.createElement('P')
  castP.innerHTML = `<b>CAST</b>: ${tdjson.Actors}`
  newDiv.appendChild(castP)
  const genreP = document.createElement('P')
  genreP.innerHTML = `<b>GENRE</b>: ${tdjson.Genre}`
  newDiv.appendChild(genreP)
  const langP = document.createElement('P')
  langP.innerHTML = `<b>LANGUAGE</b>: ${tdjson.Language}`
  newDiv.appendChild(langP)
  const plotP = document.createElement('P')
  plotP.innerHTML = `<b>PLOT</b>: ${tdjson.Plot}`
  newDiv.appendChild(plotP)
  const runtimeP = document.createElement('P')
  runtimeP.innerHTML = `<b>RUNTIME</b>: ${tdjson.Runtime}`
  newDiv.appendChild(runtimeP)
  if (tdjson.Ratings.length) {
    const ratingP = document.createElement('P')
    ratingP.innerHTML = `<b>RATING (IMDB)</b>: ${tdjson.Ratings[0].Value}`
    newDiv.appendChild(ratingP)
  }

  resDiv.appendChild(newDiv)

  // Remove all buttons, and then show those required.
  removeAllBtns()

  const backBtn = document.getElementById('backBtn')
  backBtn.style.display = 'block'
  backBtn.onclick = () => { retrieveState() }
  const favBtn = document.getElementById('favBtn')
  favBtn.innerText = 'Add to favorites'
  favBtn.style.display = 'block'
  favBtn.onclick = () => { addToFavorites(tdjson) }
  document.getElementById('showFavs').style.display = 'block'
}



showResults = (resultArray) => {
  document.getElementById('result').innerHTML = '';
  document.getElementById('showFavs').style.display = 'block';

  const rows = Math.ceil(resultArray.length / 5) 
  if(rows > 2) {
    localStorage.setItem('visibleLevel', 2);
    document.getElementById('showMore').style.display = 'block';
  }
  for(let i = 0; i < rows; i++) {
    const rowDiv = document.createElement('DIV');
    rowDiv.setAttribute('class', 'rowContainer');
    if(i > 1) {
      rowDiv.style.display = 'none';
    }
    for(let j = 0; j < 5; j++ ) {
      const colDiv = document.createElement('DIV');
      colDiv.setAttribute('class', 'cell');
      const img = document.createElement('IMG');
      const arrIndex = (i * 5) + j 
      if(arrIndex > resultArray.length - 1) {
        break
      }

      colDiv.setAttribute('id', `${resultArray[arrIndex].imdbID}`);
      colDiv.setAttribute('onClick', 'showDetails(this.id)');
      if(resultArray[arrIndex].Poster === 'N/A') {
        img.setAttribute('src', 'https://raw.githubusercontent.com/IamRaviTejaG/MovieWiki/master/images/noimg.jpg')
      } else {
        img.setAttribute('src', `${resultArray[arrIndex].Poster}`)
      }
      img.setAttribute('height', '300px');
      img.setAttribute('width', '200px');
      img.setAttribute('style', 'disply: block');
      colDiv.appendChild(img);
       

      const p = document.createElement('P');
      p.innerText = `${resultArray[arrIndex].Title} (${resultArray[arrIndex].Year})`
      p.setAttribute('class', 'nameText')
      colDiv.appendChild(p);
      rowDiv.appendChild(colDiv);
    }

    document.getElementById('result').appendChild(rowDiv);
  }
  

}

triggerSearch = (event) => {
  if(event.key === 'Enter') {
    performSearch();
  }
}