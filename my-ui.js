$(async function () {



  const $body = $("body");
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");


  let storyList = null;
  let currentUser = null;


  /**
   * Event listener for logging in, if successful we will set up the user instance.
   */

  $loginForm.on('submit', async function (evt) {
    evt.preventDefault();

    const username = $('#login-username').val();
    const password = $('#login-password').val();

    //build a User instance
    const userInstance = await User.login(username, password);

    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });


  /**
   * Event listener for signing up. If successful, it will create a new user instance
   */

  $createAccountForm.on('submit', async function (evt) {
    evt.preventDefault();

    let name = $('#create-account-name').val();
    let username = $('create-account-username').val();
    let password = $('create-account-password').val();

    //call the create method, which calls the API and then builds a new user instance.

    const newUser = await User.create(username, password, name);
    currentUser = newUser;

    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * log out functionality
   */

  $navLogOut.on('click', function () {
    localStorage.clear();
    //refresh page, clearing memory
    location.reload();
  });

  $navLogin.on('click', function () {
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });


  $('body').on('click', "#nav=all", async function () {
    hideElements();
    await generateStories();
    $allStoriesList.show();
  });


  /**
   * on page load, checks local storage to see if the user is already logged in. Renders page information accordingly.
   */

  async function checkIfLoggedIn() {
    //first, we check if we are logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    //if there is a token in local storage, call User.getLoggedInUser to get an instance of User with the right info.
    //This is designed to un once, on page load.
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
    //hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    //reset those forms
    $loginForm.trigger('reset');
    $createAccountForm.trigger('reset');

    //show the stories
    $allStoriesList.show();

    //update the naviation bar
    showNavForLoggedInUser()
  }

  /**
   * A rendering function to call the StoryList getStories static method, which will generata a storyListInstance. Then render it.
   */

  async function generateStories() {
    //get an instance of StoryList
  }

  const storyListInstance = await StoryList.getStories();
  //update our global variable
  storyList = storyListInstance;
  //empty out that part of the page
  $allStoriesList.empty();

  //loop through all of our stories and generate HTML for them
  for (let story of StoryList.stories) {
    const result = generateStoryHTML(story);
    $allStoriesList.append(result);
  }

  /**
   * a function to render HTML for an individual story instance
   */

  function generateStoryHTML(story) {
    let hostName = getHostName(story.url);

    const storyMarkup = $(`<li id="${story.storyId}"><a class="article-link" href="${story.url}" target="_blank"><strong>${story.title}</strong></a><small class="article-author">by ${story.author}</small>
          <small class="article-hostname ${hostname}">(${hostname})</small><small class="article-username">posted by ${story.username}</small></li> 
          `);
    return storyMarkup;
  }


  /**
   * hide all elements in elementsArr
   */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navLogOut.show();
  }

  /**
   * simple function to pull the hostname from a URL
   */

  function getHostName(url) {
    let hostName;
    if (url.indexOf('://' > -1)) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }


  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem('token', currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }

});