/**
 * This class maintains the list of individual Story instances
 *  It also has some methods for fetching, adding, and removing stories
 */
class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /**
   * This method is designed to be called to generate a new StoryList.
   *  It:
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.*
   */

  // TODO: Note the presence of `static` keyword: this indicates that getStories
  // is **not** an instance method. Rather, it is a method that is called on the
  // class directly. Why doesn't it make sense for getStories to be an instance method?

  static async getStories() {
    // query the /stories endpoint (no auth required)
    const response = await axios.get(`${BASE_URL}/stories`);

    // turn the plain old story objects from the API into instances of the Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    const storyList = new StoryList(stories);
    return storyList;
  }
/**
 *
 * Will return the newly created story which will be used in ui.js
 * where it will be appended to the DOM
 */
  async addStory(user, { author, title,url } ) {
    if (!user.loginToken) return null;
    let apiData = {
      token: user.loginToken,
      story: {
        author,
        title,
        url
      }
    }
    console.log('add story', apiData)
    const res = await axios.post(`${BASE_URL}/stories`, apiData )
    if(res.status === 201) {
      user.ownStories.push(res.data.story)
    }
  }



  async updateStory(User, story, storyId) {
    let response = await axios.patch(`${BASE_URL}/stories/${storyId}`, {
			token: User.loginToken,
			story: story
    });
    return response
  }


  async removeStory(user, storyId) {
    await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: "DELETE",
      data: {
        token: user.loginToken
      },
    });
    // filter out the story whose ID we are removing
    this.stories = this.stories.filter(story => story.storyId !== storyId);
    // do the same thing for the user's list of stories
    user.ownStories = user.ownStories.filter(ownStory => ownStory.storyId !== storyId);
  }
}


/**
 * The User class to primarily represent the current user.
 *  There are helper methods to signup (create), login, and getLoggedInUser
 */
class User {
  constructor(userObj) {
    this.username = userObj.username;
    this.name = userObj.name;
    this.createdAt = userObj.createdAt;
    this.updatedAt = userObj.updatedAt;

    // these are all set to defaults, not passed in by the constructor
    this.loginToken = "";
    this.favorites = [];
    this.ownStories = [];
  }

  /* Create and return a new user.
   * Makes POST request to API and returns newly-created user.
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async create(username, password, name) {
    const response = await axios.post(`${BASE_URL}/signup`, {
      user: {
        username,
        password,
        name
      }
    });

    // build a new User instance from the API response
    const newUser = new User(response.data.user);
    // attach the token to the newUser instance for convenience
    newUser.loginToken = response.data.token;
    return newUser;
  }

  /* Login in user and return user instance.
   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios.post(`${BASE_URL}/login`, {
      user: {
        username,
        password
      }
    });

    // build a new User instance from the API response
    const existingUser = new User(response.data.user);

    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.data.user.favorites.map(s => new Story(s));
    existingUser.ownStories = response.data.user.stories.map(s => new Story(s));

    // attach the token to the newUser instance for convenience
    existingUser.loginToken = response.data.token;
    console.log({existingUser})
    return existingUser;
  }

  /** Get user instance for the logged-in-user.
   *
   * This function uses the token & username to make an API request to get details
   *   about the user. Then it creates an instance of user with that info.
   */

  static async getLoggedInUser(token, username) {
    // if we don't have user info, return null
    if (!token || !username) return null;
    // call the API
    const response = await axios.get(`${BASE_URL}/users/${username}`, {
      params: {
        token
      }
    });

    // instantiate the user from the API information
    const existingUser = new User(response.data.user);
    // attach the token to the newUser instance for convenience
    existingUser.loginToken = token;
    // instantiate Story instances for the user's favorites and ownStories
    existingUser.favorites = response.data.user.favorites.map(s => new Story(s));
    existingUser.ownStories = response.data.user.stories.map(s => new Story(s));
    return existingUser;
  }

  async retrieveDetails() {
    const response = await axios.get(`${BASE_URL}/users/${this.username}`, {
      params: {
        token: this.loginToken
      }
    });
    this.name = response.data.user.name;
    this.createdAt = response.data.user.createdAt;
    this.updatedAt = response.data.user.updatedAt;
    this.favorites = response.data.user.favorites.map( s => new Story(s));
    this.ownStories = response.data.user.stories.map(s => new Story(s));

    return this;

  }

  async removeFavorite(storyId) {
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: 'DELETE',
      data: {
        token: this.loginToken
      }
    })
    await this.retrieveDetails();
    console.log(this);
    return this;
  }

  async addFavorite(storyId) {
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: 'POST',
      data: {
        token: this.loginToken
      }
    });
    // console.log(this.ownStories);
    await this.retrieveDetails();
    return this;
  }
}

/**
 * Class to represent a single story.
 */
class Story {
  /**
   * The constructor is designed to take an object for better readability / flexibility
   * - storyObj: an object that has story properties in it
   */
  constructor(storyObj) {
    this.author = storyObj.author;
    this.title = storyObj.title;
    this.url = storyObj.url;
    this.username = storyObj.username;
    this.storyId = storyObj.storyId;
    this.createdAt = storyObj.createdAt;
    this.updatedAt = storyObj.updatedAt;
  }
}