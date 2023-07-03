const movieFormModalPaneNode = document.querySelector("#movie-form-modal");
const modalCloseNode = document.querySelector("#modal__close");
const buyTicketBtnNode = document.querySelector("#buy-ticket-btn");
const moviesNode = document.querySelector("#vertical-nav__items");
const movieCardNode = document.querySelector("#movie-card");
const movieOtherDetailsNode = document.querySelector("#movie-content__details");
const ticketForm = document.querySelector("#ticket__form");

const MAIN_URL = "http://localhost:3000";

let activeMovieId = -1; // if value is -1, it is not set

const getDomainUrl = () => {
  return MAIN_URL;
};

const setActiveMovieId = (id) => {
  activeMovieId = id;
};

const getActiveMovieId = () => {
  return activeMovieId;
};

/**
 * Fethes all movies from the server using get
 * request. It returns an array of objects
 */
const fetchAllMoviesFromServer = async () => {
  return fetch(`${getDomainUrl()}/films`)
    .then((response) => response.json())
    .then((movies) => movies);
};

/**
 * Fetchs a single movie item given by id
 * @param {*} movieId
 * @returns
 */
const fetchMovieByIdFromServer = async (movieId) => {
  return fetch(`${getDomainUrl()}/films/${movieId}`)
    .then((response) => response.json())
    .then((movie) => movie);
};

/**
 * Deletes movie from the server by given id
 */
const deleteMovieByIdFromServer = (movieId) => {
  fetch(`${getDomainUrl()}/films/${movieId}`, {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
  }).then((response) => {
    if (response.status === 200) {
      buildMoviesOnDom();
    }
  });
};

/**
 * Deletes movie from the server by given id
 */
const updateMovieSoldTicketsByIdFromServer = async (movie) => {
  return fetch(`${getDomainUrl()}/films/${movie.id}`, {
    method: "PATCH",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(movie),
  })
    .then((response) => response.json())
    .then((movie) => movie);
};

const isMovieSoldOut = (movie) => {
  return movie.capacity === movie.tickets_sold;
};

const calculateAvailableMovieTickets = (movie) => {
  const availableTickets = movie.capacity - movie.tickets_sold;
  return availableTickets;
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

const buildMoviesOnDom = async () => {
  removeAllChildNodes(moviesNode);
  const movies = await fetchAllMoviesFromServer();
  movies.forEach((movie) => {
    const li = document.createElement("li");
    const div = document.createElement("div");
    const titleSpan = document.createElement("span");
    const soldOutSpan = document.createElement("span");

    titleSpan.textContent = movie.title;
    titleSpan.id = movie.id;
    soldOutSpan.textContent = "SOLD OUT";
    const isSoldOut = isMovieSoldOut(movie);

    li.classList.add("vertical-nav__item");
    div.classList.add("movie");
    titleSpan.classList.add("movie__title");
    soldOutSpan.classList.add("movie__sold-out-status");

    titleSpan.addEventListener("click", handleMovieDisplay);

    if (isSoldOut) {
      soldOutSpan.classList.add("show");
    }

    div.appendChild(titleSpan);
    div.appendChild(soldOutSpan);
    li.appendChild(div);

    moviesNode.appendChild(li);
  });

  buildMovieDetailsOnDom(movies[0]);
};
/**
 * Manipulates the dom and displays the details of clicked movie
 * @param {*} movie
 */
const buildMovieDetailsOnDom = (movie) => {
  setActiveMovieId(movie.id);
  const h1 = movieCardNode.querySelector(".movie-card__title");
  const img = movieCardNode.querySelector(".movie-card__image");
  const p = movieCardNode.querySelector(".movie-card__description");

  h1.textContent = movie.title;
  img.src = movie.poster;
  img.alt = movie.title;
  p.textContent = movie.description;

  const h3Runtime = movieOtherDetailsNode.querySelector("#run-time span");
  const h3ShowTime = movieOtherDetailsNode.querySelector("#show-time span");
  const h3AvailableTickets = movieOtherDetailsNode.querySelector(
    "#available-tickets span"
  );

  h3Runtime.textContent = movie.runtime;
  h3ShowTime.textContent = movie.showtime;
  const availableTickets = calculateAvailableMovieTickets(movie);
  h3AvailableTickets.textContent = availableTickets;

  setFormInputMaxValue(availableTickets);

  const buyTicketButton =
    movieOtherDetailsNode.querySelector("#buy-ticket-btn");
  const movieDeleteButton =
    movieOtherDetailsNode.querySelector("#delete-ticket-btn");

  movieDeleteButton.addEventListener("click", handleMovieDeletion);

  const isSoldOut = isMovieSoldOut(movie);

  if (isSoldOut) {
    buyTicketButton.textContent = "Sold Out";
    buyTicketButton.disabled = true;
  } else {
    buyTicketButton.textContent = "Buy Ticket";
    buyTicketButton.disabled = false;
  }
};

const setFormInputMaxValue = async (availableTickets) => {
  const ticketInput = ticketForm.querySelector("#modal__ticket");
  ticketInput.max = availableTickets;
};

// Handlers
const handleModalToggling = (e) => {
  e.preventDefault();
  const isOpen = movieFormModalPaneNode.classList.contains("show");

  if (isOpen) {
    movieFormModalPaneNode.classList.remove("show");
  } else {
    movieFormModalPaneNode.classList.add("show");
  }
};

const handleMovieDisplay = async (e) => {
  const movieId = e.target.id;
  const movie = await fetchMovieByIdFromServer(movieId);
  buildMovieDetailsOnDom(movie);
};

const handleMovieDeletion = (e) => {
  e.preventDefault();
  const movieId = getActiveMovieId();
  deleteMovieByIdFromServer(movieId);
};

const handleBuyingTicket = async (e) => {
  e.preventDefault();
  const ticketInputNode = e.target.querySelector("#modal__ticket");
  const boughtTickets = ticketInputNode.value;
  const movie = await fetchMovieByIdFromServer(activeMovieId);
  movie.tickets_sold += Number.parseInt(boughtTickets);
  movieFormModalPaneNode.classList.remove("show");
  updatedMovie = await updateMovieSoldTicketsByIdFromServer(movie);
  buildMovieDetailsOnDom(updatedMovie);
};

modalCloseNode.addEventListener("click", handleModalToggling);
buyTicketBtnNode.addEventListener("click", handleModalToggling);
ticketForm.addEventListener("submit", handleBuyingTicket);

window.onload = buildMoviesOnDom;
