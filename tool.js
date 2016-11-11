(function(grow){
  grow = grow || {};
  grow.ui = grow.ui || {};
  grow.ui.tools = grow.ui.tools || [];

  var notice;
  var hasInitialized = false;
  var isActive = false;
  var options = {
    keys: ['event', 'label', 'action'],
    prefix: 'ga',
    regex: null,
    trigger: 'event'
  };

  var formatAsAttr = function(key) {
    return 'data-' + options.prefix + '-' + key;
  };

  var formatAsData = function(key) {
    return (options.prefix + '-' + key).replace(/-(.)/g, function (_, first) {
      return first.toUpperCase();
    });
  };

  var formatDataItem = function(title, value) {
    var container = document.createElement('div');
    var header = document.createElement('h2');
    var content = document.createElement('p');

    header.appendChild(document.createTextNode(title));
    container.appendChild(header);
    content.appendChild(document.createTextNode(value));
    container.appendChild(content);

    return container;
  }

  var formatData = function(data) {
    var container = document.createElement('div');

    while (notice.firstChild) {
      notice.removeChild(notice.firstChild);
    }

    options.keys.forEach(function(key) {
      if (data[key]) {
        container.appendChild(formatDataItem(key.substr(1), data[key]))
      }
    });

    for (var key in data) {
      if (data.hasOwnProperty(key)
          && options.regex.test(key)
          && !options.keys.includes(key)) {
        container.appendChild(formatDataItem(key.substr(1), data[key]))
      }
    }

    notice.appendChild(container);
  };

  var onMouseOver = function(e) {
    var target = e.target;

    // Get the closet target with the correct data elements.
    while (target && !target.getAttribute(formatAsAttr(options.trigger))) {
      target = target.parentNode;
    }

    if (!target) {
      console.error('Cannot find matching target for analytics highlighting.');
      return;
    }

    var data = target.dataset;

    // SVG does not have the dataset, so mock a basic one.
    if (!data) {
      data = {};

      options.keys.forEach(function(key) {
        data[formatAsData(key)] = target.getAttribute(formatAsAttr(key));
      });
    }

    formatData(data);
  };

  var triggerTool = function() {
    document.body.classList.toggle('grow_tool__analytics_highlight--active');
    isActive = !isActive;

    if (!hasInitialized) {
      hasInitialized = true;
      notice = grow.ui.showNotice('Hover over an item with analytics attributes.');
      notice.classList.add('grow_tool__analytics_highlight__notice');

      var elements = document.querySelectorAll(
        '[' + formatAsAttr(options.trigger) + ']');
      elements.forEach(function(element) {
        element.addEventListener("mouseover", onMouseOver);
      });
    }
  };

  var init = function(config) {
    // Pull in just config overrides.
    for (var prop in config) {
      if(!config.hasOwnProperty(prop)) continue;

      options[prop] = config[prop];
    }
    options.regex = new RegExp(options.regex || '^' + options.prefix + '[A-Z].*');

    // Add styling using the trigger.
    var css = document.createElement('style');
    css.type = 'text/css';
    css.innerHTML = '.grow_tool__analytics_highlight--active [' + formatAsAttr(options.trigger) + '] {\
      background: repeating-linear-gradient(-45deg, #FBE9E7, #FFCCBC 5px, #fff 5px, #fff 10px);\
    }';
    document.body.appendChild(css);
  }

  grow.ui.tools.push({
    'kind': 'analytics-highlight',
    'name': 'Analytics Highlight',
    'button': {
      'events': {
        'click': triggerTool
      }
    },
    'init': init
  });
})(grow || window.grow);
