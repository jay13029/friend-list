const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const CARDS_PER_PAGE = 8;

const friends = JSON.parse(localStorage.getItem('friends')) || [];

const dataPanel = document.querySelector("#data-panel");
const delBtn = document.querySelector("button.delfriend");
const modalName = document.querySelector("#user-modal-name");
const modalAvatar = document.querySelector("#user-modal-avatar");
const modalDetails = document.querySelector("#user-modal-details");
const paginator = document.querySelector("#paginator");

//獲取url page
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let currentPage = urlParams.get('page') || 1;
//頁數超過當前資料則設為1
if (currentPage > Math.ceil(friends.length / CARDS_PER_PAGE)) {
  currentPage = 1;
}

// ===== Functions =====
function dataByPage(page) {
  return friends.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE)
}

function renderUserList(data) {
  let rawHTML = "";

  if (data.length === 0) {
    rawHTML = `
    <div class="d-flex">
    <h3 style="color:white">No Friend...</h3>
    <a class="btn btn-info ms-3" href="index.html">Go To Add!</a></div>`;
  } else {
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${item.avatar}"
            class="card-img-top show-details" alt="User-Image" data-bs-toggle="modal" data-bs-target="#user-modal"role="button" data-id="${item.id}">
          <div class="card-body text-center">
            <h5 class="card-title">${item.name} ${item.surname}</h5>
          </div>
        </div>
      </div>
    </div>`;
    });
  }

  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  axios.get(INDEX_URL + id).then((resp) => {
    const data = resp.data;
    modalName.innerText = data.name + " " + data.surname;
    modalAvatar.innerHTML = `<img src="${data.avatar}" alt="user-image" class="img-fluid">`;
    modalDetails.innerHTML = `
              <p>Gender: ${data.gender}</p>
              <p>Age: ${data.age}</p>
              <p>Birthday: ${data.birthday}</p>
              <p>Region: ${data.region}</p>
              <p>Email: ${data.email}</p>`;
    delBtn.setAttribute('data-id', id);
  });
}

function renderPages() {
  let rawHTML = '';
  const maxPage = Math.ceil(friends.length / CARDS_PER_PAGE);
  for (let i = 1; i <= maxPage; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function delFriend(event) {
  if (confirm("Are you sure you want to delete this friend?") === true) {
    if (!friends || !friends.length) return

    const id = Number(event.target.dataset.id);
    const getIndex = friends.findIndex((user) => user.id === id)
    if (getIndex === -1) return

    friends.splice(getIndex, 1)
    localStorage.setItem('friends', JSON.stringify(friends))
    // renderUserList(friends)
    //重新導向頁面並保留當前頁數
    window.location.href = 'friends.html?page=' + currentPage;
  }
  return;
}

function pageActive(page) {
  const current = document.querySelector('a[data-page="' + page + '"]');
  const pageItem = document.querySelectorAll('li.page-item');
  pageItem.forEach(li => li.classList.remove('active'));
  current.parentElement.classList.add('active');
}


// ===== Lisenter =====
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".show-details")) {
    showUserModal(Number(event.target.dataset.id));
  }
});

paginator.addEventListener('click', function (event) {
  if (event.target.matches("a.page-link")) {
    const page = event.target.dataset.page;
    renderUserList(dataByPage(page));
    currentPage = page;
    pageActive(page)
  }
})

delBtn.addEventListener("click", delFriend);

renderPages();
renderUserList(dataByPage(currentPage));
pageActive(currentPage)
