<messages>

  <h5>You have { messageCount } messages.</h5>
  <ul>
    <li each={ messages }>
      <span>{ title }</span>
  </ul>

  <script>
    this.messages = opts.messages;
    this.messageCount = opts.messages.length;
  </script>

</messages>