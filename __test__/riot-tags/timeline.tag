<timeline>

  <sm-view></sm-view>
  <ul>
    <li each={ stories }>{ content }</li>
  </ul>

  <script>
    this.stories = opts.stories;
  </script>

</timeline>