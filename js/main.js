$(function() {
  var linkInfo = {
    "http://google.com": {
      title: "Google",
      description: "A search engine some people occasionally use.",
      thumbnail_url: "http://itevent.net/it-companies/wp-content/uploads/tdomf/7125/google_logo.jpg"
    }
  };

  function add_shared_link(url) {
    var link = linkInfo[url];
    if (link) {
      $("#shared-links").append('<li><div><h2>' + link.title + '</h2><p>' + link.description + '</p><p><img src="' + link.thumbnail_url + '"></p></div></li>');
    }
  }

  $("form").submit(function(e) {
    e.stopPropagation();
    e.preventDefault();

    var url = $(this).find(":text").val();
    add_shared_link(url);
  });
});

