<albums>

  <h5>You have { totalAlbums } albums.</h5>
  <ul>
    <li each={ albums }>
      <span>{ title }</span>
  </ul>

  <script>
    this.albums = opts.albums;
    this.totalAlbums = opts.albums.length;
  </script>

</albums>