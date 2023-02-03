// "use strict";

const $showsList = $("#shows-list");
const $searchForm = $("#search-form");

const $modalTitle = $('.modal-title');
const $modalBody = $('.modal-body');

// Given a search term, search for TV shows that match that query
// Returns (promise) array of show objects: [show, show, ...].
// Each show object should contain exactly: {id, name, summary, image}
// (if no image URL given by API, put in a default image URL)
async function getShowsByTerm(term) {
  const config = { params: { q: term } };
  const res = await axios.get('https://api.tvmaze.com/search/shows', config);
  return res.data.map(function (obj) {
    const { id, name, summary } = obj.show;
    const image = obj.show.image ? obj.show.image.medium : 'https://tinyurl.com/tv-missing';
    return { id, name, summary, image };
  });
}

// Given an array of shows, create markup for each and add to DOM
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" data-show-name="${show.name}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm" data-toggle="modal" data-target="#exampleModal">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}

// Handle search form submission: get shows from API and display.
async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

// Given a show ID, get from API and return (promise) array of episodes:
// { id, name, season, number }
async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  return res.data.map(function (obj) {
    return { id: obj.id, name: obj.name, season: obj.season, number: obj.number };
  });
}

// Given an array of episodes, create markup for each and add to DOM */
function populateEpisodes(episodes) {
  $modalBody.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>`
    );

    $modalBody.append($episode);
  }
}

// Handle button click to show episode list: get episodes from API and display
async function displayEpisodes(evt) {
  if (evt.target.tagName !== 'BUTTON') {
    return;
  }
  const showID = evt.target.parentElement.parentElement.parentElement.dataset.showId;
  const episodes = await getEpisodesOfShow(showID);

  const showName = evt.target.parentElement.parentElement.parentElement.dataset.showName;
  $modalTitle.text(`${showName} Episodes`);

  populateEpisodes(episodes);
}

$showsList.on('click', function (evt) {
  displayEpisodes(evt);
});
