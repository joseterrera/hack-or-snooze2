async function init () {
  const navAll = document.querySelectorAll('#nav-all');
  const body = document.querySelector('body');
  const allStoriesList = document.querySelector('#all-articles-list');
  const submitForm = document.querySelector('#submit-form');
  const filteredArticles = document.querySelector('#filtered-articles');
  const loginForm = document.querySelector('#login-form');
  const createAccountForm = document.querySelector('#create-account-form');
  const ownStories = document.querySelector("#my-articles");
  const navLogin = document.querySelector("#nav-login");
  const navLogOut = document.querySelector("#nav-logout");

  const articlesContainer = document.querySelector('.articles-container')
  const mainNavLinks = document.querySelector(".main-nav-links");
  const navUserProfile = document.querySelector("#nav-user-profile");
  const navWelcome = document.querySelector('#nav-welcome');
  const navSubmit = document.querySelector('#nav-submit');
  const navFavorites = document.querySelector("#nav-favorites");
  const navMyStories = document.querySelector('#nav-my-stories');
  const favoritedStories = document.querySelector("#favorited-articles");
  const userProfiles = document.querySelector('#user-profile');

  const profileName = document.querySelector('#profile-name');
  const profileUsername = document.querySelector('#profile-username');
  const profileAccountDate = document.querySelector('#profile-account-date');



  await checkIfLoggedIn();
  // console.log('curr', currentUser)


  /**
   *  Event listener for logging in, If successful, we will setup the user instance
   */
  loginForm.addEventListener('submit', async function (evt) {
    evt.preventDefault();
    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;
    //call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    //update state from null to userInstance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    //update page for users that successfully log in.
    loginAndSubmitForm();
  });

  /**
   * Event listener for signing up, If successful we will setup a new user instance
   */
  createAccountForm.addEventListener('submit', async function (evt) {
    evt.preventDefault();
    let name = document.querySelector("#create-account-name").value;
    let username = document.querySelector("#create-account-username").value;
    let password = document.querySelector("#create-account-password").value;
    //call the create method which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    //update state for currentUser to this new user
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Log Out Functionality: empty local storage, refresh page, clear memory
   */
  navLogOut.addEventListener('click', function () {
    localStorage.clear();
    location.reload();
  });

  /**
   * Event Handler for Clicking Login: it will show login/signup forms and hide stories.
   */
  navLogin.addEventListener('click', function () {
    loginForm.classList.remove('hidden');
    createAccountForm.classList.remove('hidden');
    toggleHideShow(allStoriesList);
  });

    /** 
     * Display submit form when clicking on nav link
   */

  navSubmit.addEventListener('click', function (e) {
    if (currentUser) {
      hideElements();
      slideToggle("#submit-form");
      showEl(allStoriesList);
    }
  })

  navFavorites.addEventListener('click', function () {
    hideElements();
    if (currentUser) {
      addFavorites();
      showEl(favoritedStories);
    }
  })

  navMyStories.addEventListener('click', async function () {
    hideElements();
    if (currentUser) {
      await generateStories();
      addMyStories()
      showEl(ownStories)
      ownStories.classList.remove('hidden');
      removeStories();
    }
  })


  navUserProfile.addEventListener('click', function () {
    // console.log(currentUser)
    hideElements();
    showEl(userProfiles);
    profileName.textContent = `Name: ${currentUser.name}`;
    // show your username
    profileUsername.textContent = `Username: ${currentUser.username}`;
    // format and display the account creation date
    profileAccountDate.textContent =
      `Account Created: ${currentUser.createdAt.slice(0, 10)}`;

  })


  submitForm.addEventListener('submit', async function (event) {
    if (!currentUser) {
      showNavForLoggedInUser()
      return
    }
    let author = event.target.querySelector('#author').value;
    let title = event.target.querySelector('#title').value;
    let url = event.target.querySelector('#url').value;

    //make an axios post
    let instance = new StoryList(storyList)
    await instance.addStory(currentUser, {
      title,
      author,
      url
    })
    await generateStories();
    slideToggle('#submit-form');
    submitForm.reset();
  })


  /**
   * Event handler for Navigation to Homepage
   */

  navAll.forEach(item => item.addEventListener('click', async function () {
    hideElements();
    await generateStories();
    showEl(allStoriesList)
    addFaveClickEvent();
  }))



  function addFavorites() {
    // empty out the list by default
    empty(favoritedStories);
    const noFaves = document.createElement('h5');
    noFaves.innerText = 'No favorites added!';
    // if the user has no favorites
    if (currentUser.favorites.length === 0) {
      favoritedStories.appendChild(noFaves);
    } else {
      // for all of the user's favorites
      for (let story of currentUser.favorites) {
        // render each story in the list
        let favoriteHTML = generateStoryHTML(story, false);
        favoritedStories.appendChild(favoriteHTML);
      }
    }
  }


  async function addMyStories() {
    empty(ownStories);
    const noStoryYet = document.createElement('h5');
    noStoryYet.innerText = `${currentUser.name} has not posted any articles yet.`
    if (currentUser.ownStories.length === 0) {
      ownStories.appendChild(noStoryYet);
    } else {
      for (let story of currentUser.ownStories) {
        let ownStoryHTML = generateStoryHTML(story, true);
        ownStories.appendChild(ownStoryHTML);
      }
    }
  }


/**
 * Remove a single story
 */
  function removeStories() {
    let myStories = document.querySelectorAll('#my-articles li');
    console.log('mystories', myStories, myStories.length);
    for (let story of myStories) {
      let trashEach = story.querySelector('.trash-can');
      trashEach.addEventListener('click', async function (evt) {
        // get the Story's ID
        const closestLi = (evt.target).closest("li");
        const storyId = closestLi.getAttribute("id");
        // remove the story from the API
        await storyList.removeStory(currentUser, storyId);
        // re-generate the story list
        await generateStories();
        // hide everyhing, and then show stories
        hideElements();
        showEl(allStoriesList);
      });
    }
  }


  /**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */

  async function checkIfLoggedIn() {
    // let's see if we're logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if there is a token in localStorage, call User.getLoggedInUser
    //  to get an instance of User with the right details
    //  this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    await generateStories();

    if (currentUser) {
      showNavForLoggedInUser();
    }
  }

  /**
   * A rendering function to run to reset the forms,
   * show the stories and the nav for logged in users`
   */

  function loginAndSubmitForm() {
    hideEl(loginForm);
    hideEl(createAccountForm);
    loginForm.reset();
    createAccountForm.reset();
    showEl(allStoriesList);
    hideEl(userProfiles);
    showNavForLoggedInUser();
  }



  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */

  async function generateStories() {
    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update our global variable
    storyList = storyListInstance;
    // empty out that part of the page
    empty(allStoriesList);

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      // console.log(result);
      allStoriesList.appendChild(result);
    }
  }

  /**
   * Create a new set, 
   * return a boolean if is or isn't a fav story
   */
  function isFavorite(story) {
    let favStoryIds = new Set();
    if (currentUser) {
      favStoryIds = new Set(currentUser.favorites.map(obj => obj.storyId));
    }
    // console.log(favStoryIds);
    // console.log('fav', favStoryIds.has(story.storyId))
    //set.prototype returns a boolean indicating whether element with specified
    //value exists in a Set object or not.
    return favStoryIds.has(story.storyId);
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story, isOwnStory) {
    let hostName = getHostName(story.url);
    // let starType = isFavorite(story) ? 'fas' : 'far'
    let starType = isFavorite(story) ? "fas" : "far";
    let trashEl = document.createElement('span');
    trashEl.className = 'trash-can';
    let itrash = document.createElement('i');
    itrash.className = 'fas fa-trash-alt';
    trashEl.appendChild(itrash);
    let noTrash = document.createElement('span');

    let trashCanIcon = isOwnStory ? trashEl : noTrash;

    // render story markup
    let storyMarkup = document.createElement('li');
    let star = document.createElement('span');
    star.className = 'star';
    storyMarkup.id = story.storyId;
    let iTag = document.createElement('i');
    iTag.className = `fa-star ${starType}`;
    star.appendChild(iTag);
    let aTag = document.createElement('a');
    aTag.className = 'article-link';
    aTag.href = story.url;
    aTag.setAttribute('target', 'a_blank');
    let strongEl = document.createElement('strong');
    strongEl.innerText = story.title;
    storyMarkup.appendChild(trashCanIcon);
    storyMarkup.appendChild(star)
    storyMarkup.appendChild(aTag);
    aTag.appendChild(strongEl);
    const smallAuthor = document.createElement('small');
    smallAuthor.className = 'article-author';
    smallAuthor.innerText = `by ${story.author} `;
    const smallHostname = document.createElement('small');
    smallHostname.className = `article-hostname ${hostName}`;
    smallHostname.innerText = hostName;
    const smallUsername = document.createElement('small');
    smallUsername.className = 'article-username';
    smallUsername.innerText = `posted by ${story.username}`;
    storyMarkup.append(smallAuthor, smallHostname, smallUsername);
    return storyMarkup;
  }
  

  function addFaveClickEvent() {
    let stars = document.querySelectorAll('.star');
    for (let star of stars) {
      
      // console.log(star);
      star.addEventListener('click', async function handleStarClick(evt) {
        // console.log('hee')
        if (currentUser) {
          const tgt = evt.target;
          console.log(tgt);
          //get closest ancestor
          const closestLi = tgt.closest('li');
          // console.log(closestLi);
          const storyId = closestLi.getAttribute("id");
          // console.log(storyId);
  
          if (tgt.classList.contains("fas")) {
            await currentUser.removeFavorite(storyId);
            tgt.closest('i').classList.toggle('fas');
            tgt.closest('i').classList.toggle('far');
  
          } else {
            await currentUser.addFavorite(storyId);
            tgt.closest('i').classList.toggle('far');
            tgt.closest('i').classList.toggle('fas');
          }
        }
      })
    }
  }

  addFaveClickEvent()



  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      submitForm,
      allStoriesList,
      filteredArticles,
      ownStories,
      loginForm,
      createAccountForm,
      favoritedStories,
      userProfiles
    ];
    elementsArr.forEach(elem => hideEl(elem));
  }

  function showNavForLoggedInUser() {
    navLogin.classList.toggle('hidden')
    navLogOut.classList.toggle('hidden');
    mainNavLinks.classList.toggle('hidden');
    navUserProfile.classList.toggle('hidden');
    navWelcome.classList.toggle('hidden');
    navUserProfile.classList.toggle('hidden')
    navUserProfile.textContent = currentUser.username;
  }

}


document.addEventListener('DOMContentLoaded', init)