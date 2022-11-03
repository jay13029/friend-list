const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const CARDS_PER_PAGE = 8;

const users = [];
let filteredUser = [];

const dataPanel = document.querySelector("#data-panel");
const addBtn = document.querySelector("button.friend");
const modalName = document.querySelector("#user-modal-name");
const modalAvatar = document.querySelector("#user-modal-avatar");
const modalDetails = document.querySelector("#user-modal-details");
const schInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const noMatches = document.querySelector("#no-matches");
const showAll = document.querySelector("#show-all");

// ===== Functions =====
function renderUserList(data) {
  let rawHTML = "";

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
  dataPanel.innerHTML = rawHTML;
}

function renderPages() {
  let rawHTML = '';
  const datas = filteredUser.length ? filteredUser : users;
  const maxPage = Math.ceil(datas.length / CARDS_PER_PAGE);
  for (let i = 1; i <= maxPage; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function dataByPage(page) {
  const data = filteredUser.length ? filteredUser : users;
  return data.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE)
}

function setFriendBtn(btn) {
  btn.classList.add('btn-success');
  btn.classList.remove('btn-primary');
  btn.textContent = '✓Friend';
  btn.removeEventListener("click", addFriend)
}

function setAddBtn(btn) {
  btn.classList.add('btn-primary');
  btn.classList.remove('btn-success');
  btn.textContent = '+Add Friend';
  btn.addEventListener("click", addFriend)
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
    addBtn.setAttribute('data-id', id);

    const friends = JSON.parse(localStorage.getItem('friends')) || [];
    if (friends.some((user) => user.id === id)) { //is friend
      setFriendBtn(addBtn)
    } else {
      setAddBtn(addBtn)
    }
  });
}

function addFriend(event) {
  const id = Number(event.target.dataset.id);
  const list = JSON.parse(localStorage.getItem('friends')) || [];
  const friend = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('Already friend!')
  }

  list.push(friend)
  localStorage.setItem('friends', JSON.stringify(list))
  setFriendBtn(event.target)
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
    pageActive(page)
  }
})

schInput.addEventListener("keyup", function (event) {
  const keyword = this.value.trim().toLowerCase();
  filteredUser = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))

  if (filteredUser.length > 0) {
    noMatches.classList.add('hide');
  } else {
    noMatches.classList.remove('hide');
  }

  renderUserList(dataByPage(1));
  renderPages();
});

showAll.addEventListener('click', function () {
  filteredUser = [];
  schInput.value = '';
  noMatches.classList.add('hide');
  renderUserList(dataByPage(1));
  renderPages();
})


axios.get(INDEX_URL).then((resp) => {
  users.push(...resp.data.results);
  renderUserList(dataByPage(1));
  renderPages()
  pageActive(1)
});
