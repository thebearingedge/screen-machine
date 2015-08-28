<home>

  <h2>Welcome to the Riot Screen Machine Demo</h2>
  <p>The current date is { today }</p>
  <br>
  <sm-link to='viewLibs'>Libraries</sm-link>

  <script>
    /* globals opts:true */
    this.today = opts.today;

    this.interval = setInterval(function () {
      'use strict';
      this.today = new Date();
      this.update();
    }.bind(this), 1000);

    this.on('unmount', function () {
      'use strict';
      clearInterval(this.interval);
    }.bind(this));

  </script>
</home>