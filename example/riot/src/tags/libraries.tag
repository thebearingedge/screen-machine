<libraries>

  <h2>This is the view libraries page</h2>
<!--   <sm-link to='viewLibs.library' params='{ riotParams }'>riot</sm-link>
  <sm-link to='viewLibs.library' params='{ reactParams }'>react</sm-link>
  <sm-link to='viewLibs.library' params='{ ractiveParams }'>ractive</sm-link> -->
  <ul>
    <li style='display: inline'>
      <sm-link to='viewLibs'>none</sm-link>
    </li>
    <li each='{ libs }' style='display: inline'>
      <sm-link to='viewLibs.library' params='{ this }'>{ libName }</sm-link>
    </li>
  </ul>
  <sm-view></sm-view>

  <script>

    // this.riotParams = { libName: 'riot' };
    // this.reactParams = { libName: 'react' };
    // this.ractiveParams = { libName: 'ractive' };
    this.libs = [
      { libName: 'riot' },
      { libName: 'react' },
      { libName: 'ractive' }
    ];
  </script>

</libraries>