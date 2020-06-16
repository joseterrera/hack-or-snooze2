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

  function toggleHideShow(x) {
    // var x = document.getElementById("myDIV");
    if (x.style.display === "none") {
      x.style.display = "block";
      console.log('here');
    } else {
      console.log('there')
      x.style.display = "none";

    }
  }

  function empty(el) {
    while(el.firstChild)
    el.removeChild(el.firstChild);

  }


  function hideEl(el) {
    el.style.display = "none";
  }

  function showEl(el) {
    if (el.style.display === "none") {
      el.style.display = "block";
    }

  }






let slideOpen = true;
let heightChecked = false;
let initHeight = 0;
let openHeight = 120;
let intval = null;


function slideToggle(el) {
  var elem = document.querySelector(el);
  // console.log('elem', elem);
  initHeight = elem.offsetHeight;
  // if(!heightChecked) {
    // console.log('one', toggleContainer)
    //offsetHeight returns height of element including borders paddings, etc
    // console.log('init', initHeight)
    // heightChecked = true;
  // }
  if(initHeight > 0) {
      slideOpen = false;
    // console.log('two', toggleContainer)
    elem.style.display = 'none';
    elem.classList.toggle('hidden');
     elem.style.height = '0px';
  }
  else {
      slideOpen = true;
      elem.style.display = 'block';
      elem.classList.toggle('hidden');
      elem.style.height = 100 + '%';
  }
}


//example of slide toggle
// const mdiv =document.getElementById('mdiv');

// const mbtn = document.querySelector('#mbtn');

// mbtn.addEventListener('click', () => {
//   slideToggle(mdiv);

// })

// console.log(mdiv.offsetHeight);