"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";

const $searchForm = $("#searchForm");
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
//TODO: Research optional chaining operator ?. tentatively look if a property exists
//TODO: Could use map method instead of manually looping
async function getShowsByTerm(searchTerm) {
  const q = searchTerm;
  const params = new URLSearchParams({ q });


  const response = await fetch(`http://api.tvmaze.com/search/shows?${params}`);
  const searchData = await response.json();

  return searchData.map(object => {
    const show = object.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL
    }
  })
  };

  // OLD METHOD
  // const trimmedShows = [];
  // for (const index of searchData) {
  //   let { id, name, summary, image } = index.show;
  //   if (image === null) {
  //     image = { medium: "https://tinyurl.com/tv-missing" };
  //   }
  //   const trimmedShow = { id, name, summary, image };
  //   trimmedShows.push(trimmedShow);
  // return trimmedShows;
  // }


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */
function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}


/** EventListener for search form submit. Prevent page refresh, search and show
displays, and clear the form input.
 *
 */
$searchForm.on("submit", function handleSearchForm(evt) {
  evt.preventDefault();
  searchShowsAndDisplay();
  $("#searchForm-term").val("");
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
//TODO: Could use map method instead of manually looping
async function getEpisodesOfShow(id) {

  const response = await fetch(`http://api.tvmaze.com/shows/${id}/episodes`);
  const episodeData = await response.json();

  return episodeData.map(object => {
    return {
      id: object.id,
      name: object.name,
      season: object.season,
      number: object.number
    }
  })
  // OLD METHOD
  // const episodeList = [];
  // for (const index of episodeData) {
  //   const { id, name, season, number } = index;
  //   const trimmedEp = { id, name, season, number };
  //   episodeList.push(trimmedEp);
  // }
  // return episodeList;
}


/** Given episodes of a show, create markup for each and append to DOM. */
function displayEpisodes(episodes) {
  $episodesList.empty();

  for (const ep of episodes) {
    const { name, season, number } = ep;
    $episodesList.append(`<li>${name} (season ${season}, number ${number})</li>`);
  }

  $episodesArea.show();
}


/** Given a show ID, get episodes and display them to the DOM */
async function getEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);

  displayEpisodes(episodes);
}


/** Click listener for the button. Selects parent with class Show to determine
 * show ID. Gets the episodes and displays them to the DOM. */
//FIXED TO-DO: button can be more specific if the app has more buttons
$showsList.on("click", ".Show-getEpisodes", function handleButton(evt) {
  const showId = $(evt.target).closest('.Show').attr("data-show-id");

  getEpisodesAndDisplay(showId);
});