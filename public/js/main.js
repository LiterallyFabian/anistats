/**
 * Redirects the user to /stats/:username, where :username is the username of the user entered in the form.
 */
function redirect() {
    // get value from #username field

    let username = document.getElementById("username").value;
    if (username.includes("https://anilist.co/user/"))
        username = username.split("https://anilist.co/user/")[1].split("/")[0];

    // redirect user to /stats/:username
    window.location.href = "/stats/" + username;
}

/**
 * Sets the currently visible tab to the tab with the given id. If ID is all, all tabs are shown.
 * @param ID of the tab to set as visible
 */
function setWindow(ID) {
    console.log("Setting window to " + ID);
    $("[id*=li\-]").removeClass("active");

    if (ID !== 'all') {
        $(".stats-row").hide();
        $("#row-" + ID).show();
        $('#li-' + ID).addClass("active");
    } else {
        $(".stats-row").show();
        $("#li-all").addClass("active");
    }
}

$(document).ready(function () {
    // set default window to all
    setWindow('all');

    // set up click handlers for tabs
    $("[id*=li\-]").click(function () {
            let ID = $(this).attr("id").split("-")[1];
            setWindow(ID);
        }
    );
});
