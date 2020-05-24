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


  const body = document.querySelector('body');
  const allStoriesList = document.querySelector('#all-articles-list');
  const submitForm = document.querySelector('#submit-form');
  const filteredArticles = document.querySelector('#filtered-articles');
  const loginForm = document.querySelector('#login-form');
  const createAccountForm = document.querySelector('#create-account-form');



  const profileName = document.querySelector('#profile-name');
  const profileUsername = document.querySelector('#profile-username');
  const profileAccountDate = document.querySelector('#profile-account-date');
  const trashCan = document.querySelector('.trash-can');

  // global storyList variable
  let storyList = null;

  // global currentUser variable
  let currentUser = null;

  await checkIfLoggedIn();
  // console.log('curr', currentUser)


  /**
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */

  $loginForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page-refresh on submit

    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */

  $createAccountForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page refresh

    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
    
  });

  /**
   * Log Out Functionality
   */

  $navLogOut.on("click", function() {
    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   */

  $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });


  function generateFaves() {
    $favoritedStories.empty();

    if(currentUser.favorites.length === 0) {
      $favoritedStories.append(`<h5>${currentUser.name} has not favorited any articles yet!</h5>`)
    } else {
      for (let story of currentUser.favorites) {
        let favoritedStoriesHTML = generateStoryHTML(story,false);
        $favoritedStories.append(favoritedStoriesHTML);
      }
    }
  }

  function generateMyStories() {
    $ownStories.empty();
    if(currentUser.ownStories.length === 0) {
      $ownStories.append(`<h5>${currentUser.name} has not written any articles yet</h5>`)
    } else {
      for(let story of currentUser.ownStories) {
        let ownStoryHTML = generateStoryHTML(story, true);
        $ownStories.prepend(ownStoryHTML);
      }
    }
    $ownStories.show();
  }


  /**
   * Display submit form when clicking on nav link
   */
  $navSubmit.on('click', function() {
    if(currentUser) {
      hideElements();
      $submitForm.slideToggle();
      $allStoriesList.show();

    }
  })


  $navFavorites.on('click', function() {
    hideElements();
    if (currentUser) {
      generateFaves();
      $favoritedStories.show();
    }
  });


  $body.on('click', "#nav-my-stories", function() {
    hideElements();
    // $userProfiles.hide();
    if(currentUser) {
      generateMyStories()
      $ownStories.show()
    }
  })

  $body.on('click', "#nav-user-profile" , function() {
    // console.log(currentUser)
    hideElements();
    $userProfiles.show();
    // profileName.append( ` ${currentUser.name}`);
    // profileUsername.append( ` ${currentUser.username}`);
    // profileAccountDate.append(` ${ currentUser.createdAt.slice(0,10)}`)
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
      submitForm.reset();


    })
 



  /**
   * Event handler for Navigation to Homepage
   */

  $("body").on("click", "#nav-all", async function() {
    hideElements();
    await generateStories();
    $allStoriesList.show();
  });


  /**
   * Event handler to delete trash can
   */

   $body.on('click', trashCan, async function(evt) {
    const $closestLi = $(evt.target).closest("li");
    const storyId = $closestLi.attr("id");

    // remove the story from the API
    await storyList.removeStory(currentUser, storyId);

    // re-generate the story list
    await generateStories();

    // hide everyhing
    hideElements();

    // ...except the story list
    $allStoriesList.show();
   })

  

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
   * A rendering function to run to reset the forms and hide the login info
   */

  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();
    $userProfiles.hide();

    // update the navigation bar
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
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
    }
  }


  function isFavorite(story) {
    let favStoryIds = new Set();
    if (currentUser) {
      favStoryIds = new Set(currentUser.favorites.map(obj => obj.storyId));
    }
    return favStoryIds.has(story.storyId);
  }



  function generateStoryHTML(story, isOwnStory) {
    let hostName = getHostName(story.url);
    // let starType = isFavorite(story) ? 'fas' : 'far'
    let starType = isFavorite(story) ? "fas" : "far";

    const trashIcon = isOwnStory ? 
    `<span class="trash-can">
      <i class="fas fa-trash-alt"></i>
      </span>` 
      : "";

    // render story markup
    const storyMarkup = $(`
      <li id="${story.storyId}">
      ${trashIcon}
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

    return storyMarkup;
  }


  $('.articles-container').on('click', '.star', async function(e) {
    if(currentUser) {
      const $tgt = $(e.target);
      const $closestLi = $tgt.closest('li');
      const storyId = $closestLi.attr("id");

      if($tgt.hasClass("fas")) {
        await currentUser.removeFavorite(storyId);
        $tgt.closest('i').toggleClass('fas far');
      } else {
        await currentUser.addFavorite(storyId);
        $tgt.closest('i').toggleClass('fas far')
      }
    }
  })

  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm,
      $favoritedStories,
      $userProfiles
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navLogOut.show();
    $mainNavLinks.toggleClass('hidden');
    $navUserProfile.toggleClass('hidden');
    $navWelcome.show();
    $navLogOut.show();
    $navUserProfile.toggleClass('hidden')
    $navUserProfile.text(currentUser.username);
  }

  /* simple function to pull the hostname from a URL */

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  /* sync current user information to localStorage */

  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
});
