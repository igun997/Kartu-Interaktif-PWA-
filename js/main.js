var deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  // beforeinstallprompt Event fired

  // e.userChoice will return a Promise.
  // For more details read: https://developers.google.com/web/fundamentals/getting-started/primers/promises
  e.userChoice.then(function(choiceResult) {

    console.log(choiceResult.outcome);

    if (choiceResult.outcome == 'dismissed') {
      console.log('User cancelled home screen install');
    } else {
      console.log('User added to home screen');
    }
  });
});


$(document).ready(function() {
  var data = []
  $("#proses").on("click", function() {
    $("#cameras").removeAttr("hidden", false);
    instan("qrVid");
  });

  function instan(id) {
    let scanner = new Instascan.Scanner({
      video: document.getElementById(id)
    });
    scanner.addListener('scan', function(cId) {
      getTokoh(cId);
      $("#cameras").attr("hidden", true);
      scanner.stop();
    });
    Instascan.Camera.getCameras().then(function(cameras) {
      if (cameras.length > 0) {
        scanner.start(cameras[1]);
      } else {
        scanner.start(cameras[0]);
      }
    }).catch(function(e) {
      $("#cameras").attr("hidden", false);
      console.error(e);
    });
  }
  $("#snapCamera").on("click", function() {
    console.log("Snap Camera");
    $.mobile.loading("show", {
      text: "Loading",
      textVisible: true,
      theme: 'a',
      textonly: false
    });
    Webcam.snap(function(data_uri) {
      // $("#kontenCam").attr("hidden", false);
      // $("#camera").find(".fotoSnap").attr("src", data_uri);
      Webcam.upload(data_uri, 'https://ibio.phpina.net/rest/uploadai', function(code, text) {
        var dataText = JSON.parse(text);
        console.log(dataText);
        if (code == 200) {
          $.mobile.loading("hide");
          var html = "";
          for (let i = 0; i < dataText.data.description.captions.length; i++) {
            var d = dataText.data.description.captions[i];
            html +="<center><p><b>"+d.text+"</b></p></center>";
          }
          $("#kontenCam").attr("hidden", false);
          $("#kontenCam").html("<center><h3>Prediksi</h3></center>"+html);
        } else {
          $.mobile.loading("hide");
          $("#kontenCam").attr("hidden", false);
          $("#kontenCam").html("<center><h3>" + dataText.msg + "</h3></center>");
        }
      });
    });
  });
  $("#cameraNav").on("click", function() {
    Webcam.set({
      width: 250,
      height: 200,
      image_format: 'jpeg',
      jpeg_quality: 90
    });
    Webcam.attach('#camera_shot');
  });
  $("#resetCamera").on("click", function() {
    $("#kontenCam").attr("hidden", true);
    Webcam.reset();
  });

  function getDeck() {
    var data = getData("https://ibio.phpina.net/rest/getdata/");
    return data;
  }

  function getKartu(id) {
    var data = getData("https://ibio.phpina.net/rest/generatecard/" + id + "/1");
    return data;
  }

  function getData(url) {
    var result = null;
    $.ajax({
      url: url,
      type: 'get',
      dataType: 'json',
      async: false,
      success: function(data) {
        result = data;
      }
    });
    return result;
  }
  $("#kartu").on("click", ".listItem", function() {
    var $this = $(this);
    $.mobile.loading("show", {
      text: "Loading",
      textVisible: true,
      theme: 'a',
      textonly: false
    });
    var get = getKartu($this.data("id"));
    if (get == null) {
      get = {
        status: 0
      };
    }
    if (get.status == 1) {
      $.mobile.loading("hide");
      $("#hasilkan").find(".fotoKartu").attr("src", get.data);
    } else {
      $.mobile.loading("hide");
      $("#hasilkan").find(".kontenHasil").html("<h3>Sepertinya Data Yang Kamu Cari Tidak Ada atau Cek Koneksi Internet Kamu</h3>");
    }
  });
  $("#hasilkan").on("click", ".saveImages", function() {
    console.log("Save Images");
    var data = $("#hasilkan").find(".fotoKartu").attr("src");
    download(data, "kartu.png", "image/png");
  });
  $("#kartuNav").on("click", function() {
    $.mobile.loading("show", {
      text: "Loading",
      textVisible: true,
      theme: 'a',
      textonly: false
    });
    var deck = getDeck();
    if (deck == null) {
      deck = [];
    }
    console.log("Dek Kartu Init");
    console.log(deck);
    if (deck.length > 0) {
      $.mobile.loading("hide");
      var html = "";
      for (let i = 0; i < deck.length; i++) {
        html += '<li><a href="#hasilkan" type="button" data-id="' + deck[i].id_data + '" class="listItem">' + deck[i].nama + '</a></li>';
      }
      $("#kartu").find(".deck").html(html);
      console.log("Refresh List");
      $('#kartu').find(".deck").listview('refresh');
    } else {
      $.mobile.loading("hide");
      $("#kartu").find(".deckKonten").html('<div class="ui-body ui-body-a ui-corner-all"><h3 align="center">Belum Ada Daftar Kartu</h3></div><a href="#home" class="ui-btn ui-shadow ui-corner-all ui-btn-icon-left ui-icon-back">Kembali</a>');
    }
  });

  function getTokoh(id) {
    var data = getData("https://ibio.phpina.net/rest/getdata/" + id);
    console.log(data);
    $.mobile.loading("show", {
      text: "Loading",
      textVisible: true,
      theme: 'a',
      textonly: false
    });
    if (data == null) {
      data = {
        status: 0
      };
    }
    if (data.status == 1) {
      $.mobile.loading("hide");
      var modal = $("#dialog_onsuccess");
      modal.find(".judul").html('Data Ditemukan');
      modal.find(".nama").html(data.data.nama_tokoh);
      modal.find(".tempat_lahir").html(data.data.tempat_lahir);
      modal.find(".tanggal_lahir").html(data.data.tanggal_lahir);
      modal.find(".tanggal_wafat").html(data.data.tanggal_wafat);
      modal.find(".deskripsi").html(data.data.tentang);
      modal.find(".video").attr("src", data.data.video);
      modal.find(".foto").attr("src", data.data.foto);
      $.mobile.changePage("#dialog_onsuccess", {
        role: "dialog"
      });
    } else {
      $.mobile.loading("hide");
      $("#dialog_onerror").find(".judul").html("Data Tidak Ditemukan");
      $.mobile.changePage("#dialog_onerror", {
        role: "dialog"
      });
    }
  }

})
