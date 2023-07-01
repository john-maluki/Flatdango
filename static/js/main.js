const movieFormModalPaneNode = document.querySelector("#movie-form-modal");
const modalCloseNode = document.querySelector("#modal__close");
const buyTicketBtnNode = document.querySelector("#buy-ticket-btn");

const toggleModalPaneHandler = (e) => {
  e.preventDefault();
  const isOpen = movieFormModalPaneNode.classList.contains("show");

  if (isOpen) {
    movieFormModalPaneNode.classList.remove("show");
  } else {
    movieFormModalPaneNode.classList.add("show");
  }
};

modalCloseNode.addEventListener("click", toggleModalPaneHandler);
buyTicketBtnNode.addEventListener("click", toggleModalPaneHandler);
