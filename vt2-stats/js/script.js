$(window).on('load', function() {
  const playerTemplate = $('#player-info-template').html();
  const kruberClasses = [
    { display: "Mercenary", value: "mercenary" }, 
    { display: "Huntsman", value: "huntsman" }, 
    { display: "Foot Knight", value: "footknight" }];
    
  const bardinClasses = [
    { display: "Ranger Veteran", value: "ranger" }, 
    { display: "Ironbreaker", value: "ironbreaker" }, 
    { display: "Slayer", value: "slayer" }];
    
  const kerillianClasses = [
    { display: "Waystalker", value: "waystalker" }, 
    { display: "Handmaiden", value: "handmaiden" }, 
    { display: "Shade", value: "shade" }];
    
  const saltzpyreClasses = [
    { display: "Witch Hunter Captain", value: "whc" }, 
    { display: "Bounty Hunter", value: "bh" }, 
    { display: "Zealot", value: "zealot" }];
    
  const siennaClasses = [
    { display: "Battle Wizard", value: "bw" }, 
    { display: "Pyromancer", value: "pyromancer" }, 
    { display: "Unchained", value: "unchained" }];
  
  /* Inititalizing the page */
  const renameAttr = (attribute, i) => {
    $('.rename-' + attribute).each((name, val) => {
      $(val).attr(attribute, 'p' + (i+1) + '-' + $(val).attr(attribute));
      $(val).removeClass('rename-' + attribute);
    });
  }
  
  for (let i = 0; i < 4; ++i) {
    $('#player-info').append(playerTemplate);
    
    renameAttr('for', i);
    renameAttr('name', i);
    renameAttr('id', i);
  }
  
  list = (array_list, curID) => {
    let cur = $('#p' + curID + '-class');
    cur.html('');
    $(array_list).each((i) => {
      cur.append('<option value=\'' + array_list[i].value + '\'>' + array_list[i].display + '</option>');
    });
  }
  
  $('body').on('change', '.select-character', (val) => {
    val = val.currentTarget;
		const parent = $(val).val();
		const curID = $(val).attr('id').match(/\d+/);
    
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
$(() => {
  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   * Using Math.round() will give you a non-uniform distribution!
   */
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  const setRandomSelectOption = (sel) => {
    let $options = $(sel).find('option'),
        random = ~~(Math.random() * $options.length);
    
    $options.eq(random).prop('selected', true).change();
    if ($(sel).val() === '') $options.eq(random + getRandomInt(1, 4)).prop('selected', true).change();
  }

  $('#random').on('click', () => {
    $('#player-info input').each((idx, val) => {
      $(val).val(getRandomInt(1, 10000));
    });
    
    $('#player-info select').each((idx, val) => {
      setRandomSelectOption(val);
    });
    
    $('#match-info select').each((idx, val) => {
      setRandomSelectOption(val);
    });
    
    $('#input-date').val('2018-11-14');
  });
});

/* GET/POST REQUESTS */
$(() => {
  // change back to # later
  $('#form-add').submit((e) => {
    e.preventDefault();
    
    let playerList = [];
    for (let i = 0; i < 4; ++i) {
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
        date: $('#input-date').val(),
        players: playerList
      },
      success: (data) => {
        console.log(data);
        if (!data.status) {
          console.log('ERROR! Something went wrong!');
        }
        else {
          console.log('DATA.INSERT SUCCESS');
        } 
      }
    });
  });
});

$(() => {
  const getStats = (playerName) => {
    $.ajax({
      url: '/stats/' + playerName,
      type: 'GET',
      dataType: 'json',
      success: (data) => {
        console.log(data);
        console.log("graphing data sets...");
        
        // GRAPHING HERE
      }
    });
  };
  
  // change back to # later
  $('#form-stats').submit((e) => {
    e.preventDefault();
    
    const playerName = $('#input-name').val();
    console.log("playerName: " + playerName);
    
    $.ajax({
      url: '/searchPlayer',
      type: 'POST',
      dataType: 'json',
      data: {
        playerName: playerName
      },
      success: (data) => {
        console.log(data);
        if (!data.status) {
          console.log(data.message);
        }
        else {
          console.log(data.message);
          
          getStats(playerName);
        } 
      }
    });
  });
});
