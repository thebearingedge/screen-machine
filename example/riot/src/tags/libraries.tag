<libraries>

  <h2>This is the view libraries page</h2>
  <ul>
    <li style='display: inline'>
      <sm-link to='viewLibs'>none</sm-link>
    </li>
    <li each='{ opts.libs }' style='display: inline'>
      <sm-link to='viewLibs.library' params='{ this }'>{ libName }</sm-link>
    </li>
  </ul>
  <sm-view></sm-view>

</libraries>