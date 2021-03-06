(function() {

  var STANDARD_SIZE = 136;
  var createdCircles;  
  var color = d3.scale.category20c();

  function textWidth(text, fontSize, fontFamily){
    jQuery('body').append('<span>' + text + '</span>');
    var _lastspan = jQuery('span').last();

    _lastspan.css({
      'font-size' : fontSize,
      'font-family' : fontFamily
    })
    var width =_lastspan.width();
    _lastspan.remove();
    return width;
  };

  function smoothScrolling(hash) {
    var target = $(hash);
    target = target.length ? target : $('[name=' + hash.slice(1) +']');
    if (target.length) {
      $('html,body').animate({
        scrollTop: target.offset().top
      }, 1000);
    }
  }

  function createCircle(k, max, width, height, padding) {
    var radius = max;
    var bestX, bestY;
    var collision = true;
    var x, y;
    for (var i = 0; i < k && radius > 0 && collision; ++i) {
      for (var trials = 0; trials < 10 && collision; trials++) {
        x = Math.random() * width;
        y = Math.random() * height;
        collision = false;

        createdCircles.some(function(circle) {
          var dx = circle.x - x;
          var dy = circle.y - y;
          var distanceSquare = dx * dx + dy * dy;
          var twoRadius = radius + circle.radius + padding;
          if (distanceSquare < (twoRadius * twoRadius)) {
            collision = true;
          }
          return collision;
        });
      }

      if (collision) {
        radius -= 2;
      } else {
        bestX = x;
        bestY = y;
        break;
      }
    }
    if (collision) {
      console.log('still collision');
      return  {
        'x': -100,
        'y': -100,
        'radius': radius
      };
    } else {
      return  {
        'x': bestX,
        'y': bestY,
        'radius': radius
      };
    }
  }

  function calcFontSize(container, maxSize, text, target) {
    var fontSize = maxSize;
    var fontFamily = container.css('font-family');
    while (textWidth(text, fontSize + 'px', fontFamily) > target &&
           fontSize > 3) {
      fontSize--;
    }
    return fontSize;
  }

  function createFriendCircle(container, f, width, height, listener) {
    var defRadius = STANDARD_SIZE / 2;
    var circle = createCircle(50, defRadius, width, height, 1);

    if (circle.x === -100 || circle.y === -100) {
      // No space for this person.
      return;
    }

    var imgSrc = 'https://graph.facebook.com/' + f.uid + '/picture?type=large';
    var friend = createItem(container, imgSrc, f.name, circle.x, circle.y,
                            circle.radius / defRadius);

    createdCircles[createdCircles.length] = circle;

    friend.click(function() {
      if (listener) {
        listener(f.uid, f.name);
      }
    });
  }

  function fillTransform(jquery, x, y, scale) {
    jquery.css('transform', 'translate(' + Math.round(x) + 'px, ' +
                                           Math.round(y) + 'px) ' +
                            'scale(' + scale + ')'); // standard
    jquery.css('-webkit-transform', 'translate(' + Math.round(x) + 'px, ' +
                                                   Math.round(y) + 'px) ' +
                                    'scale(' + scale + ')'); // webkits
    jquery.css('-moz-transform', 'translate(' + Math.round(x) + 'px, ' +
                                                Math.round(y) + 'px) ' +
                                 'scale(' + scale + ')'); // mozilla
    jquery.css('-ms-transform', 'translate(' + Math.round(x) + 'px, ' +
                                               Math.round(y) + 'px) ' +
                                'scale(' + scale + ')'); // ie
    jquery.css('-o-transform', 'translate(' + Math.round(x) + 'px, ' +
                                              Math.round(y) + 'px) ' +
                               'scale(' + scale + ')'); // opera
  }

  function createItem(container, image, name, x, y, scale) {
    var item = document.createElement('div');
    item.classList.add('avatar');
    item.classList.add('friend');
    // image
    var img = document.createElement('div');
    img.classList.add('avatar-image');
    img.style.backgroundImage = 'url(\'' + image + '\')'; 
    // user name
    var userName = document.createElement('p');
    userName.classList.add('avatar-name');
    userName.textContent = name;
    // We use scale to resize it so, we can use 128px as its normal size.
    userName.style.fontSize = calcFontSize(container, 24, name, 128) + 'px';

    item.appendChild(img);
    item.appendChild(userName);
    var jqItem = $(item);

    fillTransform(jqItem, x, y, scale);
    container.append(jqItem);
    item.dataset.name = name;
    item.dataset.axleX = Math.round(x);
    item.dataset.axleY = Math.round(y);
    item.dataset.scale = scale;

    jqItem.mouseenter(function() {
      item.classList.add('focused');
      fillTransform(jqItem, x, y, 1.5);

    }).mouseleave(function() {
      item.classList.remove('focused');
      fillTransform(jqItem, x, y, scale);
    });

    return jqItem;
  }

  function createMySelf(container, width, height) {
    var item = createItem(container, $('#usericon').attr('src'),
                          $('#username').text(), width / 2, height / 2, 1);
    item.addClass('userSelf');

    createdCircles[createdCircles.length] = {
      'x': width / 2,
      'y': height / 2,
      'radius': STANDARD_SIZE / 2
    };
  }

  window.showFriendList = function(friends, listener) {
    var container = $('#friendlist');
    friends = friends.splice(0, 100);
    container.html('');
    createdCircles = [];

    // use container size to draw it
    var width = container.width();
    var height = container.height();
    var circleContainer = document.createElement('div');
    circleContainer.classList.add('friends-container');
    container.append(circleContainer);
    // inner size
    width -= STANDARD_SIZE;
    height -= STANDARD_SIZE;
    // create self circle
    createMySelf($(circleContainer), width, height);

    var friendCount = friends.length;
    d3.timer(function() {
      var f = friends[friends.length - friendCount];
      createFriendCircle($(circleContainer), f, width, height, listener);
      return !(--friendCount);
    });
  };

})();
