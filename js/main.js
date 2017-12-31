$(document).ready(function() {

  var data = []
  $("#proses").on("click",function(){
    $("#cameras").removeAttr("hidden",false);
    instan("qrVid");
  });
  function instan(id) {
    let scanner = new Instascan.Scanner({
      video: document.getElementById(id)
    });
    scanner.addListener('scan', function(cId) {
      getTokoh(cId);
      $("#cameras").attr("hidden",true);
      scanner.stop();
    });
    Instascan.Camera.getCameras().then(function(cameras) {
      if(cameras.length > 0){
        scanner.start(cameras[1]);
      }else{
        scanner.start(cameras[0]);
      }
    }).catch(function(e) {
      $("#cameras").attr("hidden",false);
      console.error(e);
    });
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

  function getTokoh(id) {
    var data = getData("https://ibio.phpina.net/rest/getdata/" + id);
    console.log(data);
    $.mobile.loading("show", {
      text: "Loading",
      textVisible: true,
      theme: 'a',
      textonly: false
    });
    if (data.status == 1) {
      $.mobile.loading("hide");
      var modal = $("#dialog_onsuccess");
      modal.find(".judul").html('Data Ditemukan');
      modal.find(".nama").html(data.data.nama_tokoh);
      modal.find(".tempat_lahir").html(data.data.tempat_lahir);
      modal.find(".tanggal_lahir").html(data.data.tanggal_lahir);
      modal.find(".tanggal_wafat").html(data.data.tanggal_wafat);
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
