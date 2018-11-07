$(window).on('load', function() {
  console.log('script loaded');
  
  var playerTemplate = $('#player-info-template').html();
  var kruberClasses = [
    {display: "Mercenary", value: "mercenary" }, 
    {display: "Huntsman", value: "huntsman" }, 
    {display: "Foot Knight", value: "footknight" }];
    
  var bardinClasses = [
    {display: "Ranger Veteran", value: "ranger" }, 
    {display: "Ironbreaker", value: "ironbreaker" }, 
    {display: "Slayer", value: "slayer" }];
    
  var kerillianClasses = [
    {display: "Waystalker", value: "waystalker" }, 
    {display: "handmaiden", value: "handmaiden" }, 
    {display: "shade", value: "shade" }];
    
  var saltzpyreClasses = [
    {display: "Witch Hunter Captain", value: "whc" }, 
    {display: "Bounty Hunter", value: "bh" }, 
    {display: "Zealot", value: "zealot" }];
    
  var siennaClasses = [
    {display: "Battle Wizard", value: "bw" }, 
    {display: "Pyromancer", value: "pyromancer" }, 
    {display: "Unchained", value: "unchained" }];
  
  /* Inititalizing the page */
  function renameAttr(attribute, i) {
    $('.rename-' + attribute).each(function() {
      $(this).attr(attribute, 'p' + (i+1) + '-' + $(this).attr(attribute));
      $(this).removeClass('rename-' + attribute);
    });
  }
  
  for (var i = 0; i < 4; ++i) {
    $('#player-info').append(playerTemplate);
    
    renameAttr('for', i);
    renameAttr('name', i);
    renameAttr('id', i);
  }
  
  function list(array_list, curID) {
    var cur = $('#p' + curID + '-class');
    cur.html('');
    $(array_list).each(function (i) {
      cur.append('<option value=\'' + array_list[i].value + '\'>' + array_list[i].display + '</option>');
    });
  }
  
  $('body').on('change', '.select-character', function() {
		var parent = $(this).val(); //get option value from parent 
		var curID = $(this).attr('id').match(/\d+/);
    console.log("Parent: " + parent);
    console.log("curID: " + curID);
    
		switch(parent) {
      case 'Kruber':
        list(kruberClasses, curID);
        break;
      case 'Bardin':
        list(bardinClasses, curID);
        break;
      case 'Kerillian':
        list(kerillianClasses, curID);
        break;
      case 'Saltzpyre':
        list(saltzpyreClasses, curID);
        break;
      case 'Sienna':
        list(siennaClasses, curID);
        break;
      default:
        $('#p' + curID + '-class').html('');	 
        break;
    }
  });
});

/* GET/POST REQUESTS */
$(function() {
  $('#form-add').submit(function(e) {
    e.preventDefault();
      $.ajax({
        url: "addGame",
        type: "POST",
        dataType: 'json',
        data: {
          difficulty: $('#select-difficulty').val(),
          map: $('#select-map').val(),
          didWin: $('#select-victory').val(),
          players: [
            {
              'name': $('#p1-name').val(),
              
            },
            {},
            {},
            {}
          ]
          
          p1name: $('#p1-name').val(),
          p1character: $('#p1-character').val(),
          
          //
        },
        success: (data) => {
          if (!data.status) {
            $('#addStatus').html(data.message);
          } else if (data.insert) {
            $('#addStatus').html($('#addform input[name=artist]').val() + ' - ' + $('#addform input[name=title]').val() + ' was successfully added.');
          } else {
            $('#addStatus').html($('#addform input[name=artist]').val() + ' - ' + $('#addform input[name=title]').val() + ' was successfully updated.');
          }
        }
      });
  });
});