$(async function() {
  // cache some selectors we'll be using quite a bit
  const $body = $("body");
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");

  const $mainNavLinks = $(".main-nav-links");
  const $navUserProfile = $("#nav-user-profile");
  const $navWelcome = $('#nav-welcome');
  const $navSubmit = $('#nav-submit');
  const $navFavorites = $("#nav-favorites");
  const $favoritedStories = $("#favorited-articles");
  const $userProfiles = $('#user-profile');

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
  const favoritedStories = document.querySelector("#favorited-articles");
  const userProfiles = document.querySelector('#user-profile');

  const profileName = document.querySelector('#profile-name');
  const profileUsername = document.querySelector('#profile-username');
  const profileAccountDate = document.querySelector('#profile-account-date');
  const trashCan = document.querySelector('.trash-can');


  await checkIfLoggedIn();
  // console.log('curr', currentUser)


  /**
   *  Event listener for logging in.
   *  If successfully we will setup the user instance
   */
   loginForm.addEventListener('submit', async function(evt) {
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
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */
  createAccountForm.addEventListener('submit', async function(evt) {
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
  navLogOut.addEventListener('click', function() {
    localStorage.clear();
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   * It will show both login and signup forms
   * and hide stories.
   */
  navLogin.addEventListener('click', function() {
      $loginForm.slideToggle();
      $createAccountForm.slideToggle();
      toggleHideShow(allStoriesList);
  });


  function addFavorites() {
    // empty out the list by default
    $favoritedStories.empty();

    // if the user has no favorites
    if (currentUser.favorites.length === 0) {
      $favoritedStories.append("<h5>No favorites added!</h5>");
    } else {
      // for all of the user's favorites
      for (let story of currentUser.favorites) {
        // render each story in the list
        let favoriteHTML = generateStoryHTML(story, false);
        $favoritedStories.append(favoriteHTML);
      }
    }
  }


  function addMyStories() {
    $ownStories.empty();
    if(currentUser.ownStories.length === 0) {
      $ownStories.append(`<h5>${currentUser.name} has not written any articles yet</h5>`)
    } else {
      for(let story of currentUser.ownStories) {
        let ownStoryHTML = generateStoryHTML(story, true);
        $ownStories.append(ownStoryHTML);
      }
    }
    $ownStories.show();
  }


  // function addUserStoriesAndFaves(parameter, boolean) {
  //   parameter.empty();
  //   if(currentUser.ownStories.length === 0) {
  //     parameter.append(`<h5>${currentUser.name} has not written any articles yet</h5>`)
  //   } else {
  //     for(let story of currentUser.ownStories) {
  //       let ownStoryHTML = generateStoryHTML(story, boolean);
  //       parameter.append(ownStoryHTML);
  //     }
  //   }
  //   parameter.show();
  // }


  /**
   * Display submit form when clicking on nav link
   */

  navSubmit.addEventListener('click', function() {
    if(currentUser) {
      hideElements();
      $submitForm.slideToggle();
      showEl(allStoriesList);
    }
  })

  // $navSubmit.on('click', function() {
  //   if(currentUser) {
  //     hideElements();
  //     $submitForm.slideToggle();
  //     $allStoriesList.show();

  //   }
  // })


  navFavorites.addEventListener('click', function() {
    hideElements();
    if(currentUser) {
      addFavorites();
      showEl(favoritedStories);
    }
  })


  // $navFavorites.on('click', function() {
  //   hideElements();
  //   if (currentUser) {
  //     addFavorites();
  //     $favoritedStories.show();
  //   }
  // });


  $body.on('click', "#nav-my-stories", async function() {
    hideElements();
    $userProfiles.hide();
    if(currentUser) {
      await generateStories();
      addMyStories()
    
      $ownStories.show()
    }
  })

  /**
   * Event Handler for Deleting a Single Story
   */

  $ownStories.on("click", ".trash-can", async function(evt) {
    // get the Story's ID
    const $closestLi = $(evt.target).closest("li");
    const storyId = $closestLi.attr("id");

    // remove the story from the API
    await storyList.removeStory(currentUser, storyId);

    // re-generate the story list
    await generateStories();

    // hide everyhing
    hideElements();
    // $ownStories.show()

    // ...except the story list
    $allStoriesList.show();
  });


  $body.on('click', "#nav-user-profile" , function() {
    // console.log(currentUser)
    hideElements();
    $userProfiles.show();
    profileName.textContent = `Name: ${currentUser.name}`;
    // show your username
    profileUsername.textContent = `Username: ${currentUser.username}`;
    // format and display the account creation date
    profileAccountDate.textContent = 
      `Account Created: ${currentUser.createdAt.slice(0, 10)}`
    ;
    
  })


  // async function handleSubmit($submitForm) {
    $submitForm.on('submit', async function(event) {
      if(!currentUser) {
        showNavForLoggedInUser()
        return
      }

      let author = event.target.querySelector('#author').value;
      let title = event.target.querySelector('#title').value;
      let url = event.target.querySelector('#url').value;

      //make an axios post
      // let instance = new StoryList(storyList);
      let instance = new StoryList(storyList)
      // await instance.addStory(currentUser, {title, author, url})

      await instance.addStory(currentUser,{
        title,
        author,
        url
      })
      await generateStories();
      $submitForm.slideUp("slow");
      submitForm.reset();


    })
  // }

  // handleSubmit($submitForm)


  /**
   * Event handler for Navigation to Homepage
   */


    navAll.forEach(item =>  item.addEventListener('click', async function() {
      //handle click
      hideElements();
      await generateStories();
      $allStoriesList.show();
    }))
    
  


  // $("body").on("click", "#nav-all", async function() {
  //   hideElements();
  //   await generateStories();
  //   $allStoriesList.show();
  // });



  

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
    // $allStoriesList.empty();
    empty(allStoriesList);

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
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
    console.log('fav', favStoryIds.has(story.storyId))
    return favStoryIds.has(story.storyId);
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story, isOwnStory) {
    let hostName = getHostName(story.url);
    // let starType = isFavorite(story) ? 'fas' : 'far'
    let starType = isFavorite(story) ? "fas" : "far";
    //trash can that only displays under currentUser's stories
    const trashCanIcon = isOwnStory
    ? `<span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`
    : "";

    // render story markup
    const storyMarkup = (`
      <li id="${story.storyId}">
      ${trashCanIcon}
        <span class="star">
          <i class="${starType} fa-star"></i>
        </span>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);
    // console.log(storyMarkup);
    return storyMarkup;
  }
  // document.querySelectorAll('.star').forEach(item => {
  //   item.addEventListener('click', async function(e) {
  $('.articles-container').on('click', '.star', async function(evt) {
      if(currentUser) {
        const tgt = evt.target;
        //get closest ancestor
        const closestLi = tgt.closest('li'); 
        const storyId = closestLi.attr("id");

        if(tgt.classList.contains("fas")) {
          await currentUser.removeFavorite(storyId);
          tgt.closest('i').toggleClass('fas far');
        } else {
          await currentUser.addFavorite(storyId);
          tgt.closest('i').classList.toggle('fas far');
        }
      }
    })


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

});
