<libraries>
  <ul>
    <li style='display: inline'>
      <sm-link to='home' active='active'>Home</sm-link>
    </li>
    <li style='display: inline'>
      <sm-link to='viewLibs' active='active'>Libraries</sm-link>
    </li>
  </ul>
  <h2>This is the view libraries page</h2>
  <ul>
    <li each='{ lib in opts.libs }' style='display: inline'>
      <sm-link to='viewLibs.library' params='{ lib }' active='active'>{ lib.libName }</sm-link>
    </li>
  </ul>
  <sm-view></sm-view>

</libraries>