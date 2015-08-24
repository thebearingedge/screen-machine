<libraries>

  <h2>This is the view libraries page</h2>
  <ul>
    <li style='display: inline'>
      <sm-link to='viewLibs' active='active'>none</sm-link>
    </li>
    <li each='{ lib in opts.libs }' style='display: inline'>
      <sm-link to='viewLibs.library' params='{ lib }' active='active'>{ lib.libName }</sm-link>
    </li>
  </ul>
  <sm-view></sm-view>

</libraries>