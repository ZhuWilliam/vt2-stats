$(window).on('load', function() {
  var playerTemplate = $('#player-info-template').html();
  var kruberClasses = [
    { display: "Mercenary", value: "mercenary" }, 
    { display: "Huntsman", value: "huntsman" }, 
    { display: "Foot Knight", value: "footknight" }];
    
  var bardinClasses = [
    { display: "Ranger Veteran", value: "ranger" }, 
    { display: "Ironbreaker", value: "ironbreaker" }, 
    { display: "Slayer", value: "slayer" }];
    
  var kerillianClasses = [
    { display: "Waystalker", value: "waystalker" }, 
    { display: "Handmaiden", value: "handmaiden" }, 
    { display: "Shade", value: "shade" }];
    
  var saltzpyreClasses = [
    { display: "Witch Hunter Captain", value: "whc" }, 
    { display: "Bounty Hunter", value: "bh" }, 
    { display: "Zealot", value: "zealot" }];
    
  var siennaClasses = [
    { display: "Battle Wizard", value: "bw" }, 
    { display: "Pyromancer", value: "pyromancer" }, 
    { display: "Unchained", value: "unchained" }];
  
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

/** For testing random inputs.
 *  Inserts random integers for all text inputs and selects random options for selects.
 */
$(function() {
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function setRandomSelectOption(sel) {
    var $options = $(sel).find('option'),
        random = ~~(Math.random() * $options.length);
    
    $options.eq(random).prop('selected', true).change();
    if ($(sel).val() === '') $options.eq(random + getRandomInt(1, 4)).prop('selected', true).change();
  }

  $('#random').on('click', function() {
    $('#player-info input').each(function() {
      $(this).val(getRandomInt(1, 10000));
    });
    
    $('#player-info select').each(function() {
      setRandomSelectOption(this);
    });
    
    $('#match-info select').each(function() {
      setRandomSelectOption(this);
    });
  });
});

/* GET/POST REQUESTS */
$(function() {
  $('#form-add').submit(function(e) {
    e.preventDefault();
    
    var playerList = [];
    for (var i = 0; i < 4; ++i) {
      curPlayer = 'p' + (i + 1);
      playerList.push(
      {
        'name': $('[name=' + curPlayer + '-name]').val(),
        'character' : $('#' + curPlayer + '-character').val(),
        'class' : $('#' + curPlayer + '-class').val(),
        'kills' : $('[name=' + curPlayer + '-kills]').val(),
        'specials' : $('[name=' + curPlayer + '-specials]').val(),
        'ranged' : $('[name=' + curPlayer + '-ranged]').val(),
        'melee' : $('[name=' + curPlayer + '-melee]').val(),
        'damageDealt' : $('[name=' + curPlayer + '-damage-dealt]').val(),
        'damageMonsters' : $('[name=' + curPlayer + '-damage-monsters]').val(),
        'damageTaken' : $('[name=' + curPlayer + '-damage-taken]').val(),
        'hs' : $('[name=' + curPlayer + '-hs]').val(),
        'saves' : $('[name=' + curPlayer + '-saves]').val(),
        'revives' : $('[name=' + curPlayer + '-revives]').val(),
        'ff' : $('[name=' + curPlayer + '-ff]').val()
      });
    };
    
    $.ajax({
      url: 'addGame',
      type: 'POST',
      dataType: 'json',
      data: {
        difficulty: $('#select-difficulty').val(),
        map: $('#select-map').val(),
        didWin: $('#select-win').val(),
        players: playerList
      },
      success: (data) => {
        console.log(data);
        if (!data.status) {
          console.log('ERROR! Something went wrong!');
        } else if (data.insert) {
          console.log('DATA.INSERT');
          //$('#addStatus').html($('#addform input[name=artist]').val() + ' - ' + $('#addform input[name=title]').val() + ' was successfully added.');
        } else {
          console.log('ELSE');
          //$('#addStatus').html($('#addform input[name=artist]').val() + ' - ' + $('#addform input[name=title]').val() + ' was successfully updated.');
        }
      }
    });
  });
});