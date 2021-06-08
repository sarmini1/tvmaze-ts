import axios from "axios"
import * as $ from 'jquery';
import { ids } from "webpack";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $('#episodesList');
const $searchForm = $("#searchForm");
const BASE_API_URL = "http://api.tvmaze.com/";

interface Show {
  id: number,
  name: string,
  summary: string,
  image: {original: string}
};

interface Episode {
  id: number,
  name: string,
  season: string,
  number: string
};

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  let response = await axios.get(`${BASE_API_URL}search/shows?q=${term}`);

  let showResponses = response.data.map((r: {show: Show})  => {
    let showObj = {
      id: r.show.id, 
      name: r.show.name, 
      summary: r.show.summary, 
      image: r.show.image.original || "https://tinyurl.com/tv-missing"}
    return showObj;
  });

  return showResponses;
}



/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 mr-3">
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

async function searchForShowAndDisplay(): Promise<void> {
  const term = $("#searchForm-term").val() as string;
  console.log("FORM INPUT TERM-->", term);
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> { 
  const response = await axios.get(`${BASE_API_URL}shows/${id}/episodes`);

  let episodeResponses = response.data.map((e: Episode) => {
    let episodeObj = {
      id: e.id, 
      name: e.name, 
      season: e.season, 
      number: e.number
    }
    return episodeObj;
  })

  return episodeResponses;
}

/** populateEpisodes function
 * 
 * Receives: array of episodes [{Episode}, {Episode}, ...]
 * 
 * Loops over episodes, creates HTML for each episode and appends to DOM
 */

function populateEpisodes(episodes: Episode[]): void {
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>`
    ) 
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** searchForEpisodesAndDisplay function
 * 
 * receives: click event 
 * 
 * Lists episodes for show that was clicked on, creates HTML and appends to DOM.
 */
async function searchForEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {
  console.log("DISPLAY EPISODES FIRED");
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}
$showsList.on("click", ".Show-getEpisodes",searchForEpisodesAndDisplay);