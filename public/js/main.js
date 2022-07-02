function redirect() {
    // get value from #username field

    let username = document.getElementById("username").value;
    if (username.includes("https://anilist.co/user/"))
        username = username.split("https://anilist.co/user/")[1].split("/")[0];

    // redirect user to /stats/:username
    window.location.href = "/stats/" + username;

}